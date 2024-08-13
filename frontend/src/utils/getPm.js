const getPm = (time) => {
    let newTime = time.slice(time.length-3).trim()
    return newTime
}

export default getPm