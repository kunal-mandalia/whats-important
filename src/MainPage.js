import './App.css';
import { Calendar } from './Calendar';
import { useMediaQuery } from './hooks/useMediaQuery'
import { Media } from './Media';
import { Notes } from './Notes';
import { Menu } from './Menu';

function MainPage() {
  const isSmall = useMediaQuery('(max-width: 1200px)');
  return (
    <div className="App">
      <Menu />
      <header className="App-header">
      </header>
      <div className="Responsive-layout">
        <Media />
        <Notes />
        <Calendar isSmall={isSmall} />
      </div>
    </div>
  );
}

export default MainPage;
