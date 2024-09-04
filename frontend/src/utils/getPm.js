const getPm = (time) => {
    let newTime = new Date(time).getHours() > 11 ? 'PM' : 'AM'
    return newTime
}

const getPmString = (time) => {

    let newTime = (time.slice(time.length-2) === 'AM' || time.slice(time.length-2) === 'PM') ?
    time.slice(0, time.length-3) : time
    newTime = newTime.slice(0, newTime.length-3)
    return newTime
}

export { getPm, getPmString}