export function calculateTapReward(base:number){
 let reward = base;
 if(Math.random() < 0.05){ reward *= 5; } // crit
 return reward;
}