const getTime = (time) => {
    let newTime = new Date(time).toDateString()+
    ', '+new Date(time).toLocaleTimeString().slice(0,4)+new Date(time).toLocaleTimeString().slice(7)
    
    return newTime
}

export default getTime
/*
const getTime = (time) => {
    let newTime = time.slice(0, time.length-3)
    newTime = newTime.slice(0, newTime.length-3)
    return newTime
}

export default getTime*/