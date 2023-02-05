import './App.css';
import { Calendar } from './Calendar';
import { useMediaQuery } from './hooks/useMediaQuery'
import { Media } from './Media';
import { Notes } from './Notes';
import { Menu } from './Menu';

function HomePage() {
  const isSmall = useMediaQuery('(max-width: 1200px)');
  const responsiveClass = isSmall ? "Small" : "Responsive-layout";
  return (
    <div className="App">
      <Menu />
      <header className="App-header">
      </header>
      <div className={responsiveClass}>
        <Media />
        <Notes />
        <Calendar isSmall={isSmall} />
      </div>
    </div>
  );
}

export default HomePage;
