export default "hel=11111112>133";

let input = document.createElement('input');
document.body.appendChild(input);
module.hot.dispose = function(){
    input.removeFrom(document.body);
}