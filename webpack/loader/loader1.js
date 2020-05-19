function loader(inputSource){
   let cb = this.async()
  setTimeout(()=>{
    console.log('loader1')
    cb(null,inputSource)
  },2000)
  // console.log('loader1=====>',this.data)
  // return inputSource +'//loader1'
}

loader.pitch = function(remindingRequest,previousRequest,data){
  console.log('111111111111111')
  data.pitch1 = 'pitch1'
}

module.exports = loader