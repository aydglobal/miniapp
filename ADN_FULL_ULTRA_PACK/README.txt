ADN FULL PACK (Tap + Chest)

1. src/components içine dosyaları koy:
   - TapCoreUltra.tsx
   - ChestSystem.tsx

2. CSS'i import et (ultra.css)

3. App.tsx:

import TapCoreUltra from "./components/TapCoreUltra";
import ChestSystem from "./components/ChestSystem";

<TapCoreUltra onTap={() => addCoins(1)} />
<ChestSystem />

4. /public/sounds içine:
   tap.mp3
   chest.mp3
