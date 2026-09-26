import bgImage from './assets/MENU_BG_3.jpeg';
import './App.css';

function App() {
  return (
    <div id="screen">
      <img id="bgimg" src={bgImage} alt="img"/>
      <main>
        <div class="d-grid gap-2 col-6 mx-auto" id="panel">
          <button id="btn1">Играть</button>
          <button id="btn2">Зарегистрироваться</button>
        </div>
      </main>
    </div>
  )
}

export default App
