# 🐝 Hive Game (TypeScript)

Implementation of the classic abstract board game **Hive** using TypeScript, HTML5 canvas and simple game logic.  
This was developed as a Rush project at **Hive School** (42 Helsinki).  

---

## 🎮 About the Game

Hive is an abstract strategy game for two players, similar in depth to Chess or Go, but played without a board.  
Players take turns placing or moving their insect pieces. The goal is to **completely surround the opponent’s Queen Bee**.

Main features of this implementation:
- Two-player game (White vs Black).
- Rules enforced:
  - Queen Bee must be placed by the 4th turn.
  - New pieces must touch at least one of your own pieces (with exceptions for the first 2 moves).
  - No placing pieces directly adjacent to the opponent’s hive (until connected).
  - The hive must always stay intact (no breaking into two groups).
  - Correct movement logic for Beetle, Grasshopper, Spider, Ant, Queen Bee.
- Win detection when a Queen Bee is surrounded.
- Interactive HTML5 canvas board with drag & drop placement.
- Popup windows for rules and win messages.

---

## 📜 Rules Recap

1. **Placement**  
   - First piece (White) can go anywhere.  
   - Second piece (Black) must be placed adjacent to the first.  
   - Later pieces must touch at least one of your own and may not touch an opponent directly.  

2. **Queen Bee**  
   - Must be placed by your **4th turn**.  
   - No moving pieces until your Queen is on the board.  

3. **One Hive Rule**  
   - All pieces must form a single continuous group.  
   - You cannot move a piece if doing so would split the hive.  

4. **Freedom to Move**  
   - Sliding pieces require space to move in/out of a hex.  

5. **Stacking (Beetle)**  
   - Beetles can climb on top of other pieces.  
   - Only the top piece of a stack is active.  

6. **Win Condition**  
   - If a Queen Bee is surrounded on all 6 sides, that player loses.  

---

## 🛠️ Installation & Run

Clone the repository and install dependencies:

```bash
git clone https://github.com/<your-username>/Hive-abstract-game.git
cd Hive-abstract-game
npm install
```

Run in dev mode with Vite:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Open in browser at: [http://localhost:5173](http://localhost:5173)

---

## ✨ Features to Add (Future Work)

- online multiplayer.  
- Drag and drop moves.  
- User friendly message for forbidden move.


---
