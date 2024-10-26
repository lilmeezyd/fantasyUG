const getPm = (time) => {
    let newTime = new Date(time).getHours() > 11 ? 'PM' : 'AM'
    return newTime
}

const getPmString = (time) => {
    let hrs = new Date(time).getHours()
    let minutes = new Date(time).getMinutes() < 10 ? `0${new Date(time).getMinutes()}` : new Date(time).getMinutes()
    let newHrs = +hrs > 11 ? hrs-12 : hrs
    let newTime = `${newHrs}:${minutes}`
    return newTime

}

export { getPm, getPmString}