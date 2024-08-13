const getTime = (time) => {
    let newTime = new Date(time).toDateString()+
    ', '+new Date(time).toLocaleTimeString().slice(0,4)+new Date(time).toLocaleTimeString().slice(7)
    console.log(newTime)
    console.log(time)
    return newTime
}

export default getTime