export const bokehChanger = (bokehPass, paramName, paramsValue) => {
    bokehPass.uniforms[paramName].value = paramsValue;
}