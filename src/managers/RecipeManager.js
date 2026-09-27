import recipesData from '../data/recipes.json' with { type: 'json' };
import ingredientsData from '../data/ingredients.json' with { type: 'json' };

class RecipeManager {
  constructor() {
    this.recipes = new Map();
    this.ingredients = new Map();
    this.init();
  }

  init() {
    recipesData.forEach(r => this.recipes.set(r.id, r));
    ingredientsData.forEach(ing => this.ingredients.set(ing.id, ing));
  }

  getRecipe(id) {
    return this.recipes.get(id);
  }

  getAllRecipes() {
    return Array.from(this.recipes.values());
  }

  getIngredient(id) {
    return this.ingredients.get(id);
  }
}

export const recipeManager = new RecipeManager();
export default recipeManager;
