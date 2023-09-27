import { useEffect, useState } from 'react'
import './App.css'
import { socket, channelId } from './socket';

function App() {
  const [gamestate, setgamestate] = useState<number[][]>([[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);

  
  const resetGame = () => {
    setgamestate([[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]])
    setIsPlayerTurn(true)
  }
  socket.onmessage = (e) => {
    const { type, channelId, payload } = JSON.parse(e.data);
    console.log(type, payload);
    if(type === "reset") {
      resetGame();
    }
    if(type === "move") {
      if(payload.isPlayerTurn) {
        playMove(payload.ridx, payload.cidx);
      }
    }

  }
  const checkWin = (gamestate : number[][]) => {
    for(let cidx = 0; cidx < 3; cidx++)
      if(gamestate[0][cidx] === gamestate[1][cidx] && gamestate[1][cidx] === gamestate[2][cidx] && gamestate[0][cidx]!== -1) return true;
    for(let ridx = 0; ridx < 3; ridx++)
      if(gamestate[ridx][0] === gamestate[ridx][1] && gamestate[ridx][1] === gamestate[ridx][2] && gamestate[ridx][0]!== -1) return true;
    
    if(gamestate[0][0] === gamestate[1][1] && gamestate[1][1] === gamestate[2][2] && gamestate[0][0]!== -1) return true;
    if(gamestate[0][2] === gamestate[1][1] && gamestate[1][1] === gamestate[2][0] && gamestate[0][2]!== -1) return true;
    return false;
  }

  const playMove = (ridx : number, cidx :number) => {
    if(gamestate[ridx][cidx] !== -1) return;
    
    setgamestate(prevState => {
      const newstate = [...prevState];
      newstate[ridx][cidx] = isPlayerTurn? 1 : 0;
      
      setIsPlayerTurn(!isPlayerTurn);
      return newstate;
    })
    
  }
  useEffect(() => {
    if(checkWin(gamestate)) {
      setTimeout(() => {
        alert("Player " + (!isPlayerTurn? "X" : "O") + " wins!")
        resetGame();
      },10);
    }
    else if(gamestate.every(row => row.every(cell => cell !== -1))){
      setTimeout(() => {
        alert("It's a draw!")
        resetGame();
      }, 10);
    }
  }, [gamestate])
  return (
    <>
      <h2>Tic Tac Toe</h2>
      <p>
        {isPlayerTurn? "X" : "O"}'s turn
      </p>
      <div className="card">
        {gamestate.map((element, ridx) => {
          return (<div className="row" key={ridx}>
            {element.map((cell, cidx) => {
              return (
              <div className="cell" key={cidx} onClick={() => {
                socket.send(JSON.stringify({ type : "move", channelId, payload: { isPlayerTurn, ridx, cidx }}));
                playMove(ridx, cidx)
                }}>
                {cell === -1 ? "" : (cell === 0 ? <O/> : <X/>)}
              </div>
              )})}
          </div>)
        })}
      </div>
      <button onClick={() => {
          socket.send(JSON.stringify({ type : "reset", channelId}));
          resetGame();
        }}>
        New Game
      </button>
    </>
  )
}

function O() {
  return "O"
}
function X() {
  return "X"
}
export default App
