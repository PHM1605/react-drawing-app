import { useLayoutEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm";

const generator = rough.generator();

function createElement(id, x1, y1, x2, y2, type) {
  const roughElement = type==='line' 
    ? generator.line(x1, y1, x2, y2)
    : generator.rectangle(x1, y1, x2-x1, y2-y1);
  return {id, x1, y1, x2, y2, type, roughElement};
}

const isWithinElement = (x, y, element) => {
  const {type, x1, y1, x2, y2} = element;
  if (type === "rectangle") {
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  } else {
    const a = {x: x1, y: y1};
    const b = {x: x2, y: y2};
    const c = {x, y};
    const offset = (distance(a, c) + distance(b, c)) - distance(a, b); 
    return offset < 1;
  }
}

const distance = (a, b) => 
  Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));

const getElementAtPosition = (x, y, elements) => {
  return elements.find(element => isWithinElement(x, y, element));
}

function App() {
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState("none"); // drawing when the mouse is down
  const [tool, setTool] = useState("line");
  const [selectedElement, setSelectedElement] = useState(null);

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({roughElement}) => roughCanvas.draw(roughElement))
  }, [elements])

  const updateElement = (id, x1, y1, x2, y2, type) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, type);
    const elementsCopy = [...elements];
    elementsCopy[id] = updatedElement;
    setElements(elementsCopy);
  };

  const handleMouseDown = (event) => {
    const {clientX, clientY} = event;
    if (tool === "selection") {
      // if we are on an element
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        // offset from the top left corner
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({...element, offsetX, offsetY});
        setAction("moving");
      }
    } else {
      const id = elements.length;
      const element = createElement(id, clientX, clientY, clientX, clientY, tool);
      setElements(prevState => [...prevState, element]);
      setAction("drawing");
    }
    
  }

  const handleMouseMove = (event) => {
    const {clientX, clientY} = event;

    if (tool === "selection") {
      event.target.style.cursor = selectedElement ? "move" : "default";
    }

    if (action === 'drawing') {
      const index = elements.length - 1;
      const {x1, y1} = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);

    } else if (action === 'moving') {
      const {id, x1, y1, x2, y2, offsetX, offsetY, type} = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;
      const newX1 = clientX - offsetX;
      const newY1 = clientY - offsetY;
      updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type);
    }
  }

  const handleMouseUp = (event) => {
    setAction("none");
    setSelectedElement(null);
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
