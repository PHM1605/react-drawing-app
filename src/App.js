import { useLayoutEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm";

const generator = rough.generator();

function createElement(x1, y1, x2, y2, type) {
  const roughElement = type==='line' 
    ? generator.line(x1, y1, x2, y2)
    : generator.rectangle(x1, y1, x2-x1, y2-y1);
  return {x1, y1, x2, y2, roughElement};
}

function App() {
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState("none"); // drawing when the mouse is down
  const [tool, setTool] = useState("line");

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({roughElement}) => roughCanvas.draw(roughElement))
  }, [elements])

  const handleMouseDown = (event) => {
    if (tool === "selection") {
      // if we are on an element
    } else {
      const {clientX, clientY} = event;
      const element = createElement(clientX, clientY, clientX, clientY, tool);
      setElements(prevState => [...prevState, element]);
      setAction("drawing");
    }
    
  }

  const handleMouseMove = (event) => {
    const {clientX, clientY} = event;
    if (action === 'drawing') {
      const index = elements.length - 1;
      const {x1, y1} = elements[index];
      const updatedElement = createElement(x1, y1, clientX, clientY, tool);
      const elementsCopy = [...elements];
      elementsCopy[index] = updatedElement;
      setElements(elementsCopy);
    }    
  }

  const handleMouseUp = (event) => {
    setAction("none");
  }

  return (
    <div>
      <div style={{position: "fixed"}}>
        <input type='radio' id='selection' checked={tool==="selection"} onChange={()=>setTool("selection")} />
        <label htmlFor='selection'>Selection</label>
        <input type="radio" id="line" checked={tool==="line"} onChange={()=>setTool("line")}/>
        <label htmlFor="line">Line</label>
        <input type='radio' id='rectangle' checked={tool==='rectangle'} onChange={()=>setTool('rectangle')} />
        <label htmlFor='rectangle'>Rectangle</label>
      </div>

      <canvas 
        id="canvas" 
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        Canvas
      </canvas>
    </div>
    
  );
}

export default App;
