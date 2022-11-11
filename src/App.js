import './App.css';
import AddBullet from './AddBullet';
import BulletList from './BulletList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <div className="Bullet-list-wrapper">
        <BulletList />
      </div>
      <div className="Add-bullet-wrapper">
        <AddBullet className="Add-bullet" />
      </div>
      <div>
        <p>
          App version: {process.env.REACT_APP_VERSION}
        </p>
      </div>
    </div>
  );
}

export default App;
