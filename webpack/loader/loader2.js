function loader(inputSource){
  let cb = this.async()
  setTimeout(()=>{
    console.log('loader2')
    cb(null,inputSource)
  },2000)
  // return inputSource
}

loader.pitch = function(remindingRequest,previousRequest,data){
  console.log('pitch2')
  // return '12'
}

module.exports = loader