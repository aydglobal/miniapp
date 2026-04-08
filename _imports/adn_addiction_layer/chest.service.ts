export function rollChest(){
 const rand = Math.random();
 if(rand < 0.05) return 'legendary';
 if(rand < 0.2) return 'epic';
 if(rand < 0.5) return 'rare';
 return 'common';
}