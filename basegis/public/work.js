function startTimer (data){
    setInterval(()=>{
        postMessage(data.message || 'interval')
    },data.timer || 15000)
}

onmessage = function (event){
    startTimer(event.data)
}




