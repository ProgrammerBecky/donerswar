import * as THREE from './../build/three.module.js';
import { G } from './G.js';

const WORLD_SIZE = 85000;
const LIGHT_MAP_SIZE = 512;
const LIGHT_TO_WORLD_SCALE = WORLD_SIZE / LIGHT_MAP_SIZE;

export class Lights {

	constructor() {
	
		this.matCache = {};
		this.lights = [];
		this.splats = [];
		this.lastLightsActive = 0;
		this.needsUpdate = true;
		this.hasPixelData = false;
		
		this.lightId = 0;
		
	}
	
	registerSplat({ index , splat, imageData }) {
		console.log( 'Lighting Splat ' , index );
		
		splat.getContext('2d').putImageData( imageData,0,0 );
		this.splats[ index ] = splat;
		this.needsUpdate = true;
	}	
	
	registerLight( instance ) {
		instance.id = this.lightId;
		this.lightId++;

		this.lights.push( instance );
		instance.x = instance.x / LIGHT_TO_WORLD_SCALE;
		instance.z = instance.z / LIGHT_TO_WORLD_SCALE;
		
		this.needsUpdate = true;
		return instance.id;
	}
	updateLight({ lightId , x , z , f }) {
		
		const index = this.lights.findIndex( search => search.id === lightId );
		if( index > -1 ) {
			this.lights[index].x = x/LIGHT_TO_WORLD_SCALE;
			this.lights[index].z = z/LIGHT_TO_WORLD_SCALE;
			this.lights[index].f = f;
		}

	}
	removeLight( ref ) {
		const index = this.lights.findIndex( search => search.id === ref );
		if( index > - 1 ) {
			this.lights.splice( index , 1 );
		}
		this.needsUpdate = true;
	}
	
	registerCanvas({ canvas }) {
		
		this.canvas = canvas;
		this.context = this.canvas.getContext( '2d' );
				
		this.context.beginPath();
		this.context.rect( 0 , 0 , LIGHT_MAP_SIZE , LIGHT_MAP_SIZE );
		this.context.fillStyle = "black";
		this.context.fill();

		this.globalLightMap = new THREE.CanvasTexture( this.canvas , THREE.ClampToEdgeWrapping , THREE.ClampToEdgeWrapping , THREE.LinearFilter , THREE.LinearMipMapLinearFilter );
		this.globalLightMap.wrapS = THREE.MirroredRepeatWrapping;
		this.globalLightMap.wrapT = THREE.MirroredRepeatWrapping;
		this.globalLightMap.needsUpdate = true;

		this.context.save();	
	
		G.world.load();
	
	}
	
	applyLightMapFromLambert( material ) {

		if( ! this.matCache[ material.name ] ) {
			
			let mat = new THREE.MeshStandardMaterial({
				map: material.map,
				normalMap: material.normalMap,
				metalness: 0,
				roughness: 0.85,
				envMap: G.environmentMap,
			});
			
			this.matCache[ material.name ] = this.applyLightMap( mat );
		}
		
		return this.matCache[ material.name ];
	}
	
	applyLightMap( material ) {
			
		if( ! material.map ) return material;
		
		if( typeof( material.hasLightMap ) == 'undefined' ) {
				
			material.hasLightMap = true;
			material.lightMap = this.globalLightMap;
			material.lightMapIntensity = 1.0;
			if( ! material.envMap ) material.envMap = G.environmentMap;

			material.onBeforeCompile = function ( shader ) {

				if( material instanceof THREE.MeshLambertMaterial ) {
					shader.vertexShader = shader.vertexShader.replace( 'varying vec3 vIndirectFront;' ,
						`varying vec3 vIndirectFront;
							varying vec2 worldUV;
							varying vec2 worldUV2;
							varying float lightMapAltitude;
						`
					);
				}
				else {
					shader.vertexShader = shader.vertexShader.replace( '#define STANDARD' ,
						`#define STANDARD
							varying vec2 worldUV;
							varying vec2 worldUV2;
							varying float lightMapAltitude;
						`
					);
				}
				shader.vertexShader = shader.vertexShader.replace( '#include <fog_vertex>' ,
					`#include <fog_vertex>
						worldUV = vec2( worldPosition.x / ${WORLD_SIZE}.0 , worldPosition.z / ${WORLD_SIZE}.0 );
						lightMapAltitude = max( 2000.0 - worldPosition.y , 0.0 ) / 2000.0;

						vec3 worldNrm = inverseTransformDirection( transformedNormal, viewMatrix );
						vec3 extrudePosition = worldPosition.xyz + worldNrm.xyz * vec3( 256.0 );
						worldUV2 = vec2( extrudePosition.x / ${WORLD_SIZE}.0 , extrudePosition.z / ${WORLD_SIZE}.0 );
					`
				);
				
				shader.fragmentShader = shader.fragmentShader.replace( 'varying vec3 vViewPosition;' , 
					`varying vec3 vViewPosition;
						varying vec2 worldUV;
						varying vec2 worldUV2;
						varying float lightMapAltitude;
					`
				);
											
				const lightMapType = ( shader.fragmentShader.indexOf( '#include <lights_fragment_maps>' ) > -1 )
					? '#include <lights_fragment_maps>'
					: '#include <lightmap_pars_fragment>';
					
				shader.fragmentShader = shader.fragmentShader.replace( lightMapType , 
					`
						#if defined( RE_IndirectDiffuse )
							#ifdef USE_LIGHTMAP
								vec4 lightMapTexel1 = texture2D( lightMap, worldUV );
								vec4 lightMapTexel2 = texture2D( lightMap, worldUV2 );
								float texelA = ( lightMapTexel1.r + lightMapTexel1.g + lightMapTexel1.b ) * lightMapTexel1.a;
								float texelB = ( lightMapTexel2.r + lightMapTexel2.g + lightMapTexel2.b ) * lightMapTexel2.a;
								vec4 lightMapTexel;
								if( texelA > texelB ) {
									lightMapTexel = vec4( lightMapTexel1.r*0.5 , lightMapTexel1.g*0.5 , lightMapTexel1.b*0.5 , lightMapTexel1.a );
								}
								else {
									lightMapTexel = vec4( lightMapTexel2.r*1.1 , lightMapTexel2.g*1.1 , lightMapTexel2.b*1.1 , lightMapTexel2.a );
								}
								vec3 lightMapIrradiance = lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity * lightMapAltitude;
								#ifndef PHYSICALLY_CORRECT_LIGHTS
									lightMapIrradiance *= PI; // factor of PI should not be present; included here to prevent breakage
								#endif
								irradiance += lightMapIrradiance;
							#endif
							#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
								iblIrradiance += getLightProbeIndirectIrradiance( /*lightProbe,*/ geometry, maxMipLevel );
							#endif
						#endif
						#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
							radiance += getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry.viewDir, geometry.normal, material.specularRoughness, maxMipLevel );
							#ifdef CLEARCOAT
								clearcoatRadiance += getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness, maxMipLevel );
							#endif
						#endif
					`
				);

				/* DEBUGGING
shader.fragmentShader = shader.fragmentShader.replace( 'gl_FragColor = vec4( outgoingLight, diffuseColor.a );' ,
`
vec4 lightMapTexelCheck = texture2D( lightMap, worldUV );
gl_FragColor = vec4( lightMapTexelCheck.rgb, diffuseColor.a );
`);
console.log( shader.fragmentShader );
				//*/
								
				material.userData.shader = shader;
				material.needsUpdate = true;
				
			};				
				
		}	

		return material;
		
	}
	
	getSpriteColour({ x,z }) {
		
		if( ! this.hasPixelData ) {
			console.log( 'get pixel data' );
			this.hasPixelData = this.context.getImageData( 0,0, LIGHT_MAP_SIZE,LIGHT_MAP_SIZE );
		}
		
		const px = Math.floor( x/LIGHT_TO_WORLD_SCALE );
		const pz = LIGHT_MAP_SIZE - Math.floor( z/LIGHT_TO_WORLD_SCALE );
		const index = ((pz*LIGHT_MAP_SIZE)+px)*4;

		const r = Math.min( 1 , this.hasPixelData.data[ index+0 ]/255 + G.ambient.color.r );
		const g = Math.min( 1 , this.hasPixelData.data[ index+1 ]/255 + G.ambient.color.g );
		const b = Math.min( 1 , this.hasPixelData.data[ index+2 ]/255 + G.ambient.color.b );

		return new THREE.Color( r,g,b );
		
	}
	
	update( delta ) {
		if( ! this.canvas ) return;
		if( ! this.needsUpdate ) return;
		var lightsActive = 0;

		if( Math.random() < 0.05 ) console.log( 'lights' , this.lights.length );

		this.context.globalCompositeOperation = 'copy';

		this.context.beginPath();
		this.context.rect( 0 , 0 , LIGHT_MAP_SIZE , LIGHT_MAP_SIZE );
		this.context.fillStyle = "black";
		this.context.fill();
				
		this.context.globalCompositeOperation = 'lighter';
		this.lights.map( light => {
			if( this.splats[ light.splat ] ) {
									
				let x = light.x;
				let z = LIGHT_MAP_SIZE - light.z;

				if( x > -light.splatSize && z > -light.splatSize
				&&	x < LIGHT_MAP_SIZE+light.splatSize && z < LIGHT_MAP_SIZE+light.splatSize
				) {
					
					this.context.save();
					this.context.translate( x , z );
					this.context.rotate( light.f );
					this.context.drawImage(
						this.splats[ light.splat ],
						-light.splatSize,
						-light.splatSize
					);
					this.context.restore();
					
				}
			}
			
		});	
		this.context.translate( 0 , 0 )
		this.context.rotate( 0 );

		this.globalLightMap.needsUpdate = true;
		if( lightsActive > 0 || this.lastLightsActive > 0 ) {
			if( this.lastLightsActive !== lightsActive ) {
				this.lastLightsActive = lightsActive;
				console.log( 'Lights Active' , lightsActive );
			}
		}	
		this.needsUpdate = false;
		this.hasPixelData = false;
		G.particles.particles.map( particle => {
			if( particle.ent ) {
				particle.ent.material.color = this.getSpriteColour({
					x: particle.ent.position.x,
					z: particle.ent.position.z
				});
			}
		});
		
	}

}

console.log( 'Lighting Loaded' );