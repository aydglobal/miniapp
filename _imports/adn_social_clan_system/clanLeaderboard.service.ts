export function calculateClanScore(members){
 return members.reduce((acc, m) => acc + m.score, 0);
}