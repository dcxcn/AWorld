varying vec2 vUv;

uniform float iTime;
uniform float lineCount;
void main(){
    vec2 uv=-1.+2.*vUv;
    float time=iTime*.3+0.*.01;
    // To create the BG pattern
    vec3 wave_color=vec3(0.0);
    // To create the waves
    float wave_width=.01;
    uv.y-=.8;
    for(float i=0.;i<12.;i++){
        if(i>=lineCount) break;
        // uv.y += cos(i * 2.0 + iTime ) > 0.0 ? sin(i * 2.0 + iTime ) : -sin(i * 2.0 + iTime ) ;
        // 控制线条运动方式。  sin 内部控制速度    外面控制幅度
        uv.y+=sin(i*2.3+iTime)*1.;
        // 控制线条宽度
        wave_width=abs(1./(40.*uv.y));
        wave_color+=vec3(wave_width,wave_width*3.9,wave_width*4.5);
    }
    gl_FragColor=vec4(wave_color,((wave_color.r+wave_color.g+wave_color.b)/4.)-.2);
}
