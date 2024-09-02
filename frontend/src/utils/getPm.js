const getPm = (time) => {
    let newTime = time.slice(time.length-3).trim()
    return newTime
}

const getPmString = (time) => {

    let newTime = time.slice(0, time.length-3)
    newTime = newTime.slice(0, newTime.length-3)
    return newTime
}

export { getPm, getPmString}