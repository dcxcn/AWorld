uniform float attenuation;
uniform vec3 color;
uniform sampler2D texture;

varying vec2 vUv;
varying float vAlpha;

void main() {

vec4 textureColor = texture2D( texture, vUv );
gl_FragColor = vec4( textureColor.rgb * color.rgb, textureColor.a * vAlpha );
gl_FragColor.a *= pow(  abs(gl_FragCoord.z), attenuation );
}
