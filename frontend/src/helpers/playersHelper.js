//let curPage = 1

export const getMinMax = (players) => {
    let prices = []
    let maxPrice = players?.length > 0 ? 
    Math.max(...players.map(x => (x.nowCost).toFixed(1))) : 0
    let minPrice = players?.length > 0 ?  
    Math.min(...players.map(x => (x.nowCost).toFixed(1))) : 0
    
    for(let i=maxPrice; i>=minPrice; i-=0.5) {
        prices.push((i.toFixed(1)))
	
    }

    return { prices, minPrice, maxPrice }
} 
 
export const getPlayers = (players, sort, view, word, cutPrice) => {
    let id
    const filteredPlayers = []
    if(players) {
    if(view?.startsWith('position')) {
        id = view.slice(9)
        filteredPlayers.push(...players.filter(x => x.playerPosition === parseInt(id)))
    } else if(view?.startsWith('team')) {
        id = view.slice(5)
        filteredPlayers.push(...players.filter(x => x.playerTeam === id))
    } else {
        filteredPlayers.push(...players)
    }
}
    const sortPlayer = (x,y) => {
        if(+x[sort]>+y[sort]) return -1
        if(+x[sort]<+y[sort]) return 1
    }
    
    const returnedPlayers = filteredPlayers
                            .sort(sortPlayer)
                            .filter(player => +(player.nowCost).toFixed(1)<=cutPrice)
                            .filter(player => player?.firstName?.toLowerCase()?.includes(word.toLowerCase())
                            || player?.secondName?.toLowerCase()?.includes(word.toLowerCase())
                        || player?.appName?.toLowerCase()?.includes(word.toLowerCase()))
                            //.filter(player => player.appName.toLowerCase().startsWith(word?.toLowerCase()))

    

    return { returnedPlayers }
}

export const getArrangedPlayers = (players, curPage, pageSize) => {
    const returned = (event, idx) => {
        let start = (curPage-1)*pageSize
        let end = curPage*pageSize
        if(idx >= start && idx < end) return true
    }
    const returnedPlayers = players
                            .filter(returned)

    const goalkeepers = returnedPlayers
                        .filter(player => player.playerPosition === 1)
    
    const defenders = returnedPlayers
                        .filter(player => player.playerPosition === 2)
                                
    const midfielders = returnedPlayers
                        .filter(player => player.playerPosition === 3)

    const forwards = returnedPlayers
                        .filter(player => player.playerPosition === 4)

    return { goalkeepers, defenders, midfielders, forwards}
}



