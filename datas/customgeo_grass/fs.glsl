precision mediump float;
uniform sampler2D map;
uniform sampler2D alphaMap;
varying vec2 vUv;
varying float frc;

void main() {
  //Get transparency information from alpha map
  float alpha = texture2D(alphaMap, vUv).r;
  //If transparent, don't draw
  if(alpha < 0.15){
    discard;
  }
  //Get colour data from texture
  vec4 col = vec4(texture2D(map, vUv));
  //Add more green towards root
  col = mix(vec4(0.0, 0.6, 0.0, 1.0), col, frc);
  //Add a shadow towards root
  col = mix(vec4(0.0, 0.1, 0.0, 1.0), col, frc);
  gl_FragColor = col;
}