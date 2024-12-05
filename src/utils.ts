export function random(num: number){
    let options = "abcdefghijklmnopqrstuvwxyz123456789"
    let len = options.length
    let ans = ''

    for(let i = 0; i < num; i++){
        ans += options[Math.floor(Math.random() * len)]
    }

    return ans
}