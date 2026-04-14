import Pear from './Pear.jsx';
import Loaf from './Loaf.jsx';
import Bottle from './Bottle.jsx';
import Jar from './Jar.jsx';
import Leaf from './Leaf.jsx';
import Fish from './Fish.jsx';
import Cup from './Cup.jsx';
import Basket from './Basket.jsx';
import Sprig from './Sprig.jsx';
import Sun from './Sun.jsx';
import Wheat from './Wheat.jsx';

export { Pear, Loaf, Bottle, Jar, Leaf, Fish, Cup, Basket, Sprig, Sun, Wheat };

const CATEGORY_MAP = {
  'fruits': Pear,
  'vegetables': Leaf,
  'produce': Pear,
  'fruits-vegetables': Pear,
  'bakery': Loaf,
  'bread': Loaf,
  'dairy': Bottle,
  'dairy-eggs': Bottle,
  'pantry': Jar,
  'staples': Jar,
  'snacks': Jar,
  'meat': Fish,
  'seafood': Fish,
  'meat-seafood': Fish,
  'beverages': Cup,
  'drinks': Cup,
  'herbs': Leaf,
};

const CATEGORY_TINT = {
  'fruits': 'bg-rose',
  'vegetables': 'bg-sage',
  'produce': 'bg-rose',
  'fruits-vegetables': 'bg-rose',
  'bakery': 'bg-butter',
  'bread': 'bg-butter',
  'dairy': 'bg-butter',
  'dairy-eggs': 'bg-butter',
  'pantry': 'bg-butter',
  'staples': 'bg-butter',
  'snacks': 'bg-butter',
  'meat': 'bg-rose',
  'seafood': 'bg-sage',
  'meat-seafood': 'bg-rose',
  'beverages': 'bg-sage',
  'drinks': 'bg-sage',
  'herbs': 'bg-sage',
};

export function getIllustrationForCategory(slug) {
  if (!slug) return Leaf;
  return CATEGORY_MAP[slug.toLowerCase()] || Leaf;
}

export function getTintForCategory(slug) {
  if (!slug) return 'bg-sage';
  return CATEGORY_TINT[slug.toLowerCase()] || 'bg-sage';
}
