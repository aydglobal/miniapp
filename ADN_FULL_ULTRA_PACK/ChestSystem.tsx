import { motion } from "framer-motion";
import { useState } from "react";

export default function ChestSystem() {
  const [reward, setReward] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const openChest = () => {
    const amount = Math.floor(Math.random() * 200 + 50);
    setReward(amount);
    setOpen(true);

    const audio = new Audio("/sounds/chest.mp3");
    audio.play();
  };

  return (
    <div className="chest-container">
      {!open ? (
        <motion.div
          className="chest-box"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={openChest}
        >
          🎁
        </motion.div>
      ) : (
        <motion.div
          className="chest-reward"
          initial={{ scale: 0 }}
          animate={{ scale: 1.2 }}
        >
          +{reward} ADN
        </motion.div>
      )}
    </div>
  );
}
