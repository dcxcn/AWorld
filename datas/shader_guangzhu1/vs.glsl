#include <common>

uniform float speed;
uniform float time;
uniform float timeOffset;
varying vec2 vUv;
varying float vAlpha;

void main() {

vec3 pos = position;

float l = ( time * speed * 0.01 ) + timeOffset;
float f = fract( l ); // linear time factor [0,1)
float a = f * f; // quadratic time factor [0,1)

// slightly animate the vertices of light shaft if necessary

pos.x += cos( l * 20.0 ) * sin( l * 10.0 );

vAlpha = saturate( 0.7 + min( 1.0, a * 10.0 ) * ( sin( a * 40.0 ) * 0.25 ) );

 vUv = uv;

gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

}