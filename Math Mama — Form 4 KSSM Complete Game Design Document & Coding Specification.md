# MATH MAMA: WARUNG MATEMATIK
## Complete Production Game Design Document
### Form 4 KSSM Mathematics — Malaysia

**Working title:** Math Mama: Warung Matematik  
**Genre:** Educational cooking simulation + mini-games + restaurant management  
**Platform:** Web browser / PC / Chromebook / tablet / mobile  
**Technology:** HTML5 + Phaser.js + JavaScript/TypeScript  
**Target:** Malaysian Form 4 students  
**Curriculum:** KSSM Mathematics Form 4  
**Primary language:** English-ready architecture, with Bahasa Melayu content as the default option  
**Multiplayer:** 2–4 players initially; scalable to whole-class mode  
**Deployment:** GitHub + Netlify/Vercel  
**Game style:** Colourful 2D cartoon, Malaysian food/kopitiam aesthetic  
**Educational objective:** Make students repeatedly apply Form 4 Mathematics through meaningful gameplay rather than conventional question-answer screens.

---

# 1. CORE GAME VISION

Create a game inspired by the gameplay philosophy of cooking simulation games such as Cooking Mama, but do NOT copy its characters, artwork, branding, UI, music, or proprietary assets.

The game should feel like:

**Cooking Simulation**
+
**Time Management**
+
**Restaurant Management**
+
**Mathematics Challenge**
+
**Progression RPG**
+
**Multiplayer Competition**

The player starts with a tiny Malaysian food stall.

They must:

1. Choose a recipe.
2. Buy ingredients.
3. Calculate quantities.
4. Prepare ingredients.
5. Solve mathematical challenges.
6. Complete cooking mini-games.
7. Serve customers.
8. Earn money.
9. Calculate profit.
10. Upgrade the restaurant.
11. Unlock new recipes and areas.
12. Master all 10 Form 4 Mathematics chapters.

The mathematical questions must feel like part of the gameplay.

Avoid making the game:

> "Question → four buttons → correct answer → next question."

Instead use:

> "Game situation → mathematical reasoning → player action → consequence."

---

# 2. GAME TAGLINE

Primary:

**MASAK. KIRA. UNTUNG. MENANG.**

English:

**COOK. CALCULATE. PROFIT. MASTER.**

Alternative:

**Every Recipe Has a Maths Problem.**

---

# 3. TARGET LEARNING OUTCOMES

The game should reinforce:

- Mathematical reasoning
- Problem solving
- Mathematical communication
- Application of mathematics in real-life situations
- Interpretation of graphs
- Algebraic manipulation
- Logical thinking
- Set operations
- Network/graph reasoning
- Statistical interpretation
- Probability
- Financial decision-making

The game should encourage:

- trial and error
- checking answers
- estimation
- strategic decision making
- time management
- collaboration

---

# 4. FORM 4 KSSM CURRICULUM MAP

The game must cover all 10 Form 4 Mathematics chapters.

## WORLD 1 — QUADRATIC KITCHEN

### Bab 1
**Fungsi dan Persamaan Kuadratik dalam Satu Pemboleh Ubah**

Core concepts:

- quadratic expressions
- quadratic functions
- graphs
- roots
- factorisation
- completing the square
- quadratic formula
- discriminant
- maximum/minimum
- solving problems involving quadratic equations

Cooking theme:

**"The Pancake Lab"**

Players experiment with pancake shapes, tray dimensions and cooking trajectories.

---

## WORLD 2 — NUMBER BASES MARKET

### Bab 2
**Asas Nombor**

Core concepts:

- base systems
- place value
- conversions
- operations in different bases
- applications of number bases

Cooking theme:

**"Digital Night Market"**

Ingredients and prices are displayed in different number bases.

Example:

> Ingredient price = 1011₂

Player must convert before purchasing.

---

## WORLD 3 — LOGIC CAFÉ

### Bab 3
**Penaakulan Logik**

Core concepts:

- statements
- negation
- implication
- converse
- inverse
- contrapositive
- logical arguments
- deductive reasoning

Cooking theme:

**"Mystery Café"**

Players investigate customer orders and determine which statements are logically valid.

---

## WORLD 4 — SETS FOOD COURT

### Bab 4
**Operasi Set**

Core concepts:

- sets
- subsets
- universal set
- intersection
- union
- complement
- Venn diagrams
- applications of sets

Cooking theme:

**"Food Court Manager"**

Customers belong to multiple food preference groups.

Example:

A = customers who like spicy food.

B = customers who like noodles.

Find:

A ∩ B

A ∪ B

A'

---

## WORLD 5 — DELIVERY NETWORK

### Bab 5
**Rangkaian dalam Teori Graf**

Core concepts:

- networks
- vertices
- edges
- degree
- paths
- circuits
- weighted networks
- shortest routes
- network applications

Cooking theme:

**"Food Delivery Empire"**

Players manage delivery routes between:

- suppliers
- kitchen
- restaurants
- customers

Players must determine efficient routes.

---

## WORLD 6 — MARKET PLANNER

### Bab 6
**Ketaksamaan Linear dalam Dua Pemboleh Ubah**

Core concepts:

- linear inequalities
- regions
- graphical representation
- systems of inequalities
- feasible regions
- applications

Cooking theme:

**"Market Budget Challenge"**

Player has limited:

- money
- cooking time
- ingredients
- storage

They must determine which combination of products can be produced.

---

## WORLD 7 — DELIVERY DASH

### Bab 7
**Graf Gerakan**

Core concepts:

- distance-time graphs
- velocity-time graphs
- interpretation
- gradient
- distance travelled
- speed/velocity
- motion situations

Cooking theme:

**"Rush Delivery"**

Food must be delivered before customers leave.

The player interprets graphs to determine:

- fastest driver
- stopping time
- distance
- average speed
- delivery timing

---

## WORLD 8 — DATA KITCHEN

### Bab 8
**Sukatan Serakan Data Tak Terkumpul**

Core concepts:

- range
- variance
- standard deviation
- interpretation of dispersion
- comparison of datasets

Cooking theme:

**"Restaurant Quality Control"**

Player compares:

- cooking times
- customer waiting times
- daily sales
- food temperatures
- delivery times

The objective is not merely to calculate but to decide which dataset is more consistent.

---

## WORLD 9 — PROBABILITY CARNIVAL

### Bab 9
**Kebarangkalian Peristiwa Bergabung**

Core concepts:

- combined events
- mutually exclusive events
- independent events
- dependent events
- probability calculations
- tree diagrams
- real-world probability

Cooking theme:

**"Lucky Food Carnival"**

Players predict:

- ingredient selections
- customer choices
- prize wheels
- order combinations
- random events

---

## WORLD 10 — FINANCE RESTAURANT

### Bab 10
**Matematik Pengguna: Pengurusan Kewangan**

Core concepts:

- financial planning
- income
- expenses
- budgeting
- savings
- loans
- interest
- financial decisions
- financial management

Cooking theme:

**"Build Your Food Empire"**

This becomes the game's main management system.

Players calculate:

- ingredient costs
- selling prices
- profit
- loss
- budget
- savings
- loan repayments
- interest
- cash flow

---

# 5. WORLD PROGRESSION

The player progresses through:

```text
LEVEL 1
Small Food Stall
      ↓
LEVEL 5
Gerai Upgrade
      ↓
LEVEL 10
Small Restaurant
      ↓
LEVEL 20
Café
      ↓
LEVEL 30
Food Court
      ↓
LEVEL 40
Restaurant Chain
      ↓
LEVEL 50
Malaysian Food Empire
```

Each world introduces new gameplay mechanics.

---

# 6. CORE GAME LOOP

```text
ENTER RESTAURANT
       ↓
SELECT RECIPE
       ↓
CHECK INGREDIENTS
       ↓
BUY / CALCULATE INGREDIENTS
       ↓
START COOKING
       ↓
MATH CHALLENGE
       ↓
COOKING MINI-GAME
       ↓
MATH CHALLENGE
       ↓
SERVE CUSTOMER
       ↓
CALCULATE REVENUE
       ↓
CALCULATE PROFIT
       ↓
RECEIVE XP + COINS + STARS
       ↓
UPGRADE RESTAURANT
       ↓
UNLOCK NEW RECIPE
       ↓
NEXT MISSION
```

---

# 7. COOKING MINI-GAME SYSTEM

Create reusable mini-games.

## Mini-game 1 — CHOP

Player taps/clicks ingredients in the correct sequence.

Mathematics integration:

- factorisation
- algebraic simplification
- number operations

---

## Mini-game 2 — MEASURE

Player adjusts a measuring container.

Example:

> Need 1.75 L.

Player must stop the liquid at the correct amount.

Mathematics determines the target.

---

## Mini-game 3 — MIX

Player combines ingredients according to a mathematical ratio.

Example:

```text
Flour : Water = 3 : 2
```

---

## Mini-game 4 — TEMPERATURE

Player controls stove temperature.

Mathematics determines the correct temperature/time.

---

## Mini-game 5 — TIMING

Player must press the button at the correct moment.

Uses:

- motion graphs
- time calculations
- estimation

---

## Mini-game 6 — SORT

Sort customers/ingredients according to conditions.

Uses:

- sets
- logical reasoning
- inequalities

---

## Mini-game 7 — ROUTE

Connect delivery locations.

Uses:

- graph theory
- shortest path

---

## Mini-game 8 — DATA ANALYSIS

Player examines a restaurant dashboard.

Uses:

- statistics
- dispersion

---

## Mini-game 9 — PROBABILITY WHEEL

Player calculates probability before choosing.

---

## Mini-game 10 — CASHIER

Player handles:

- price
- discount
- cost
- profit
- budget

---

# 8. 120-MISSION CAMPAIGN

Create at least **120 missions**.

Each chapter contains 12 missions.

---

# WORLD 1 — QUADRATIC KITCHEN

### Q1 Pancake Dimensions
Solve a quadratic equation to determine tray dimensions.

### Q2 Double Batch
Determine unknown ingredient quantity using a quadratic equation.

### Q3 Chocolate Tray
Factorise an expression to determine possible dimensions.

### Q4 Pancake Curve
Interpret a quadratic graph.

### Q5 Maximum Pancake
Determine maximum area.

### Q6 Oven Experiment
Find roots of a quadratic equation.

### Q7 Recipe Formula
Use quadratic formula.

### Q8 Broken Tray
Determine whether a quadratic equation has real roots.

### Q9 Catering Order
Solve a real-life quadratic problem.

### Q10 Food Stall Sign
Use quadratic dimensions to design a sign.

### Q11 Perfect Shape
Complete the square to identify the vertex.

### Q12 Master Pancake
Multi-step quadratic challenge.

---

# WORLD 2 — NUMBER BASE MARKET

### N1 Binary Price Tags
Convert binary to decimal.

### N2 Supplier Code
Convert decimal to another base.

### N3 Ingredient Inventory
Perform operations in another base.

### N4 Digital Cash Register
Add values in different bases.

### N5 Market Scanner
Identify valid representations.

### N6 Base Conversion Race
Complete conversions under time pressure.

### N7 Secret Recipe Code
Decode ingredient quantities.

### N8 Supplier Challenge
Solve a multi-step base problem.

### N9 Digital Order
Interpret number-base data.

### N10 Inventory Error
Find an incorrect calculation.

### N11 Night Market Challenge
Multiple number-base calculations.

### N12 Base Master
Mixed challenge.

---

# WORLD 3 — LOGIC CAFÉ

### L1 True or False Order
Identify statements.

### L2 Kitchen Rule
Determine negation.

### L3 Customer Condition
Interpret implication.

### L4 Chef's Rule
Determine converse.

### L5 Reverse Rule
Determine inverse.

### L6 Logic Detective
Determine contrapositive.

### L7 Mystery Customer
Evaluate an argument.

### L8 Kitchen Investigation
Identify valid reasoning.

### L9 Order Conditions
Combine statements.

### L10 Logic Trap
Identify invalid reasoning.

### L11 Detective Challenge
Multi-step logical reasoning.

### L12 Logic Master
Timed reasoning challenge.

---

# WORLD 4 — SETS FOOD COURT

### S1 Spicy Customers
Build a set.

### S2 Noodle Lovers
Intersection.

### S3 Rice Lovers
Union.

### S4 Vegetarian Group
Complement.

### S5 Venn Diagram
Complete a Venn diagram.

### S6 Lunch Crowd
Solve a customer-count problem.

### S7 Food Preferences
Two-set problem.

### S8 Three Categories
Three-set challenge.

### S9 Customer Database
Interpret set information.

### S10 Food Court Analysis
Apply set operations.

### S11 Missing Customers
Reverse-engineer a set.

### S12 Set Master
Complete multi-step challenge.

---

# WORLD 5 — DELIVERY NETWORK

### G1 Supplier Connections
Identify vertices and edges.

### G2 Restaurant Network
Determine degree.

### G3 Delivery Route
Find a path.

### G4 Complete Route
Find a circuit.

### G5 Shortest Delivery
Find shortest route.

### G6 Weighted Network
Interpret edge weights.

### G7 Fuel Cost
Choose efficient route.

### G8 Multiple Deliveries
Optimise route.

### G9 Broken Road
Redesign network.

### G10 Network Detective
Identify route errors.

### G11 Delivery Empire
Multi-stop challenge.

### G12 Network Master
Timed graph challenge.

---

# WORLD 6 — MARKET PLANNER

### I1 Ingredient Budget
Solve an inequality.

### I2 Cooking Capacity
Graph a constraint.

### I3 Two Ingredients
Two-variable inequality.

### I4 Market Region
Shade feasible region.

### I5 Production Planning
Find feasible combinations.

### I6 Budget + Time
Combine constraints.

### I7 Catering Order
Optimise within constraints.

### I8 Food Stall Expansion
Graph multiple inequalities.

### I9 Supplier Limits
Determine feasible combinations.

### I10 Kitchen Capacity
Solve real-life constraints.

### I11 Master Planner
Multi-constraint challenge.

### I12 Market Master
Timed planning mission.

---

# WORLD 7 — DELIVERY DASH

### M1 Walking Customer
Read a distance-time graph.

### M2 Delivery Speed
Calculate speed.

### M3 Driver Comparison
Compare graphs.

### M4 Waiting Time
Identify stationary periods.

### M5 Fastest Driver
Interpret gradient.

### M6 Delivery Distance
Calculate distance travelled.

### M7 Return Trip
Interpret changing motion.

### M8 Traffic Jam
Analyse graph.

### M9 Delivery Race
Compare multiple drivers.

### M10 Route Timing
Calculate delivery time.

### M11 Emergency Order
Multi-step motion problem.

### M12 Delivery Master
Timed graph challenge.

---

# WORLD 8 — DATA KITCHEN

### D1 Customer Waiting Time
Find range.

### D2 Sales Consistency
Compare dispersion.

### D3 Cooking Times
Calculate variance.

### D4 Restaurant A vs B
Compare standard deviation.

### D5 Quality Control
Interpret data.

### D6 Delivery Reliability
Analyse dataset.

### D7 Staff Performance
Compare consistency.

### D8 Daily Sales
Interpret dispersion.

### D9 Kitchen Temperature
Analyse variation.

### D10 Data Detective
Identify unusual data.

### D11 Restaurant Report
Multi-step statistical analysis.

### D12 Data Master
Timed challenge.

---

# WORLD 9 — PROBABILITY CARNIVAL

### P1 Lucky Ingredient
Simple combined event.

### P2 Two Customers
Independent events.

### P3 Food Selection
Dependent events.

### P4 Prize Wheel
Calculate probability.

### P5 Ingredient Basket
Tree diagram.

### P6 Order Combination
Combined events.

### P7 Lucky Draw
Determine probability.

### P8 Carnival Game
Compare probabilities.

### P9 Fair or Unfair?
Analyse a game.

### P10 Customer Choice
Real-world probability.

### P11 Probability Detective
Reverse probability problem.

### P12 Probability Master
Multi-step challenge.

---

# WORLD 10 — FINANCE RESTAURANT

### F1 Ingredient Cost
Calculate total cost.

### F2 Selling Price
Calculate profit.

### F3 Loss Challenge
Calculate loss.

### F4 Budget Planning
Build a daily budget.

### F5 Restaurant Expenses
Categorise expenses.

### F6 Savings Goal
Calculate required savings.

### F7 Loan Challenge
Calculate interest/repayment.

### F8 Cash Flow
Analyse income and expenses.

### F9 Expansion Decision
Evaluate affordability.

### F10 Restaurant Profit
Calculate profit margin.

### F11 Financial Crisis
Make a budget decision.

### F12 Food Empire
Full financial simulation.

---

# 9. MISSION DIFFICULTY

Each mission has:

```text
EASY
★★☆☆☆

MEDIUM
★★★☆☆

HARD
★★★★☆

MASTER
★★★★★
```

Difficulty affects:

- number of steps
- time
- hints
- numbers
- complexity
- multi-topic integration

---

# 10. STAR SYSTEM

Each mission gives:

### ⭐ 1 STAR
Complete mission.

### ⭐⭐ 2 STARS
Complete accurately.

### ⭐⭐⭐ 3 STARS
Complete accurately + efficiently.

Bonus:

### ⭐ PERFECT
No mistakes + time bonus.

Do not punish students excessively for mistakes.

The purpose is learning.

---

# 11. XP SYSTEM

Example:

```javascript
XP_REWARDS = {
  EASY: 50,
  MEDIUM: 100,
  HARD: 175,
  MASTER: 300,
  PERFECT_BONUS: 100,
  FIRST_COMPLETION: 50,
  DAILY_BONUS: 100
};
```

XP unlocks:

- recipes
- kitchens
- decorations
- chef outfits
- restaurant upgrades

---

# 12. COIN SYSTEM

Example:

```javascript
COIN_REWARDS = {
  EASY: 30,
  MEDIUM: 60,
  HARD: 100,
  MASTER: 180,
  PERFECT_BONUS: 75
};
```

Coins are used for:

- kitchen upgrades
- decorations
- ingredient stock
- equipment
- restaurant expansion

Avoid pay-to-win mechanics.

This is an educational game.

---

# 13. HEART / ENERGY SYSTEM

Do NOT use an aggressive mobile-game energy system.

Instead use:

```text
Mistakes reduce temporary cooking quality.

3 mistakes = recipe must be restarted.

No permanent penalty.
```

Students should always be able to retry.

---

# 14. HINT SYSTEM

Every question can provide:

### Hint 1
Concept hint.

### Hint 2
Formula/strategy hint.

### Hint 3
Partial working.

### Answer explanation
Full solution.

Hints reduce the maximum star rating but do not prevent completion.

---

# 15. QUESTION DATABASE ARCHITECTURE

Questions must NOT be hard-coded inside scenes.

Use JSON.

Example:

```json
{
  "id": "F4-Q1-001",
  "chapter": 1,
  "topic": "quadratic_equations",
  "difficulty": "easy",
  "type": "multiple_choice",
  "mission": "Q1",
  "language": "en",
  "context": "pancake",
  "question": "A rectangular pancake tray has area 48 cm². Its length is x + 4 cm and width is x cm. Find x.",
  "equation": "x(x + 4) = 48",
  "options": [
    "4",
    "6",
    "8",
    "12"
  ],
  "answer": 6,
  "explanation": [
    "x² + 4x = 48",
    "x² + 4x - 48 = 0",
    "(x + 8)(x - 6) = 0",
    "x = 6 because length must be positive."
  ],
  "xp": 50,
  "coins": 30,
  "skills": [
    "factorisation",
    "quadratic_equation"
  ]
}
```

---

# 16. QUESTION TYPES

Support at least:

```text
multiple_choice
numeric_input
fraction_input
algebra_input
drag_and_drop
matching
ordering
graph_selection
graph_interpretation
true_false
multi_select
route_selection
set_selection
probability_tree
budget_builder
```

---

# 17. QUESTION GENERATOR

Create a procedural question generator.

Example:

```javascript
function generateQuadraticQuestion(difficulty) {
    // Generate valid coefficients.
    // Ensure integer roots where appropriate.
    // Generate distractors based on common student errors.
    // Return a question object matching the JSON schema.
}
```

Generators should exist for:

```text
quadratic
numberBases
logic
sets
graphTheory
inequalities
motionGraphs
statistics
probability
financialManagement
```

Never generate invalid mathematics.

Every generated question must have:

- valid answer
- verified calculation
- explanation
- plausible distractors

---

# 18. DISTRACTOR SYSTEM

Wrong answers should represent common mistakes.

Example:

Correct:

```text
6
```

Distractors:

```text
-6
8
12
```

Each distractor should optionally have:

```json
{
  "value": 8,
  "feedback": "Check your factorisation."
}
```

---

# 19. MULTILINGUAL ARCHITECTURE

Support:

```text
English
Bahasa Melayu
```

Potential future:

```text
中文
```

Never hard-code visible text directly into scenes.

Use:

```text
/locales/en.json
/locales/ms.json
```

Example:

```json
{
  "start": "Start Cooking",
  "continue": "Continue",
  "hint": "Hint",
  "submit": "Submit",
  "correct": "Correct!",
  "tryAgain": "Try Again"
}
```

---

# 20. RESTAURANT ECONOMY

Each recipe has:

```javascript
{
  ingredientCost: 12.50,
  sellingPrice: 20.00,
  preparationTime: 45,
  difficulty: "medium"
}
```

Calculate:

```text
Revenue
- Ingredient Cost
- Operating Cost
= Profit
```

The financial system should become progressively more sophisticated.

---

# 21. CUSTOMER SYSTEM

Customers have:

```text
name
order
patience
budget
preferences
satisfaction
```

Example:

```javascript
{
  id: "customer_001",
  order: "nasi_lemak",
  patience: 75,
  budget: 15,
  preference: "spicy"
}
```

Correct mathematics increases satisfaction.

Wrong calculations may result in:

- incorrect quantity
- longer preparation
- reduced satisfaction
- lower profit

---

# 22. COOKING QUALITY SYSTEM

Final score:

```javascript
finalScore =
    mathAccuracy * 0.40 +
    cookingAccuracy * 0.25 +
    speed * 0.15 +
    customerSatisfaction * 0.10 +
    financialPerformance * 0.10;
```

Do not display this as a political/evaluative ranking system; it is purely a game performance metric.

---

# 23. RECIPE SYSTEM

Initial recipes:

```text
Nasi Lemak
Nasi Goreng
Mee Goreng
Chicken Rice
Curry Mee
Roti Canai
Satay
Chicken Chop
Burger
Fried Rice
ABC
Cendol
Teh Tarik
Milo Ais
Teh Ais
```

Unlock recipes progressively.

---

# 24. MALAYSIAN RESTAURANT PROGRESSION

### Stage 1
Gerai Tepi Jalan

### Stage 2
Kedai Makan

### Stage 3
Kopitiam

### Stage 4
Food Court

### Stage 5
Modern Café

### Stage 6
Restaurant

### Stage 7
Food Empire

---

# 25. CHARACTER SYSTEM

Player creates:

```text
Name
Chef name
Avatar
Hair
Outfit
Hat
Apron
Skin tone
Accessories
```

Do not require real personal information.

---

# 26. EQUIPMENT UPGRADES

Examples:

```text
Basic Stove
Advanced Stove
Commercial Stove

Basic Blender
Industrial Blender

Small Fridge
Large Fridge

Basic Knife
Chef Knife

Small Counter
Large Counter
```

Equipment can affect:

- cooking time
- ingredient capacity
- customer throughput

But mathematical ability remains the primary progression mechanism.

---

# 27. MULTIPLAYER DESIGN

## MODE A — 2 PLAYER CO-OP

Player 1:

**Chef**

Player 2:

**Math Specialist**

Chef cannot complete certain actions until the Math Specialist solves the problem.

---

## MODE B — 4 PLAYER CO-OP

Roles:

```text
PLAYER 1 — CHEF
PLAYER 2 — CASHIER
PLAYER 3 — INGREDIENT MANAGER
PLAYER 4 — DELIVERY MANAGER
```

All players receive mathematical challenges.

---

# 28. MULTIPLAYER FLOW

```text
CREATE ROOM
     ↓
ROOM CODE
     ↓
PLAYER JOIN
     ↓
READY
     ↓
HOST START
     ↓
SYNC GAME STATE
     ↓
MISSION
     ↓
COOKING
     ↓
MATH CHALLENGES
     ↓
SCORE
     ↓
RESULT
```

---

# 29. MULTIPLAYER TECHNOLOGY

Architecture should support:

### Phase 1
Local multiplayer / shared screen.

### Phase 2
Online multiplayer.

For online multiplayer use a server-authoritative architecture.

Possible technology:

```text
Frontend:
Phaser.js

Backend:
Node.js

Realtime:
Socket.IO

Database:
Supabase / Firebase / PostgreSQL

Hosting:
Netlify/Vercel frontend
Railway/Render/Supabase backend
```

Do NOT put secret API keys in frontend code.

---

# 30. ROOM SYSTEM

Example:

```javascript
{
  roomId: "ABC123",
  hostId: "player_001",
  players: [],
  gameMode: "coop4",
  missionId: "F4-Q1-001",
  status: "waiting"
}
```

Room states:

```text
WAITING
READY
PLAYING
PAUSED
RESULT
CLOSED
```

---

# 31. WHOLE-CLASS MODE

This is particularly important for school use.

Teacher creates:

```text
CLASSROOM CODE
```

Example:

```text
AMC-F4-2026
```

Students join using:

```text
Nickname
Class code
```

Avoid collecting unnecessary personal data.

---

# 32. TEACHER DASHBOARD

Teacher dashboard should show:

```text
Students Online
Missions Completed
Average Accuracy
Chapter Progress
Most Difficult Questions
Most Common Errors
Time Played
Stars Earned
```

Teacher can filter:

```text
Chapter
Class
Mission
Date
Difficulty
```

---

# 33. TEACHER GAME CONTROLS

Teacher can:

```text
START CLASS CHALLENGE
PAUSE GAME
SELECT CHAPTER
SELECT MISSION
SELECT DIFFICULTY
ENABLE HINTS
DISABLE HINTS
SET TIME LIMIT
START TEAM BATTLE
```

---

# 34. CLASS CHALLENGE

Teacher chooses:

```text
Chapter 6
Linear Inequalities
10 minutes
30 students
```

Game generates:

```text
10 questions
```

Students compete/cooperate through the same challenge.

---

# 35. LEADERBOARD

Create several separate metrics.

```text
🏆 Mission Stars
🧠 Maths Mastery
💰 Restaurant Profit
⚡ Speed Challenge
🔥 Daily Streak
```

Avoid making speed the only measure of achievement.

A student who is accurate but slower should still receive meaningful recognition.

---

# 36. BADGES

Examples:

```text
🍳 First Recipe
🧮 Algebra Chef
🔢 Number Base Master
🧠 Logic Detective
⭕ Set Specialist
🕸️ Network Master
📈 Graph Expert
📊 Data Analyst
🎲 Probability Master
💰 Finance Boss
👑 Form 4 Math Master
```

---

# 37. DAILY CHALLENGE

Each day:

```text
1 random mission
3 attempts
bonus XP
bonus coins
```

Example:

**Today's Special**

> "Can you prepare 20 meals within budget?"

---

# 38. BOSS MISSIONS

Each world ends with a boss.

Examples:

### World 1
**The Impossible Pancake**

### World 2
**Binary Night Market**

### World 3
**Mystery Customer**

### World 4
**Food Court Chaos**

### World 5
**Delivery Disaster**

### World 6
**Budget Crisis**

### World 7
**Rush Hour**

### World 8
**Restaurant Data Crisis**

### World 9
**Carnival Probability Challenge**

### World 10
**Food Empire Final Exam**

---

# 39. FINAL BOSS

## FOOD EMPIRE CRISIS

The player's restaurant has:

```text
RM10,000 budget
20 customers
limited ingredients
delivery constraints
supplier choices
loan option
```

The player must use multiple Form 4 topics.

Possible combination:

```text
Quadratic
+
Sets
+
Graph Theory
+
Inequalities
+
Motion
+
Statistics
+
Probability
+
Financial Management
```

This should feel like a game scenario rather than an exam paper.

---

# 40. PHASER.JS ARCHITECTURE

Use Phaser 3.

Recommended scene structure:

```text
BootScene
PreloadScene
MainMenuScene
ProfileScene
RestaurantScene
WorldMapScene
MissionSelectScene
CookingScene
MathChallengeScene
MiniGameScene
CustomerScene
CashierScene
ResultScene
UpgradeScene
InventoryScene
RecipeBookScene
LeaderboardScene
MultiplayerLobbyScene
MultiplayerGameScene
TeacherChallengeScene
SettingsScene
```

---

# 41. CORE ENGINE

```text
GameManager
PlayerManager
MissionManager
QuestionManager
CookingManager
RecipeManager
InventoryManager
EconomyManager
CustomerManager
ProgressManager
AchievementManager
AudioManager
SaveManager
NetworkManager
LocalizationManager
```

Each manager should have one responsibility.

Avoid one giant `game.js`.

---

# 42. PROJECT FOLDER STRUCTURE

```text
math-mama/
│
├── index.html
├── package.json
├── vite.config.js
├── README.md
│
├── public/
│   ├── favicon.png
│   └── assets/
│
├── src/
│   │
│   ├── main.js
│   │
│   ├── config/
│   │   ├── gameConfig.js
│   │   ├── constants.js
│   │   └── environment.js
│   │
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── PreloadScene.js
│   │   ├── MainMenuScene.js
│   │   ├── ProfileScene.js
│   │   ├── RestaurantScene.js
│   │   ├── WorldMapScene.js
│   │   ├── MissionSelectScene.js
│   │   ├── CookingScene.js
│   │   ├── MathChallengeScene.js
│   │   ├── MiniGameScene.js
│   │   ├── ResultScene.js
│   │   ├── UpgradeScene.js
│   │   ├── InventoryScene.js
│   │   ├── RecipeBookScene.js
│   │   ├── LeaderboardScene.js
│   │   ├── MultiplayerLobbyScene.js
│   │   └── MultiplayerGameScene.js
│   │
│   ├── managers/
│   │   ├── GameManager.js
│   │   ├── PlayerManager.js
│   │   ├── MissionManager.js
│   │   ├── QuestionManager.js
│   │   ├── CookingManager.js
│   │   ├── RecipeManager.js
│   │   ├── InventoryManager.js
│   │   ├── EconomyManager.js
│   │   ├── CustomerManager.js
│   │   ├── ProgressManager.js
│   │   ├── AchievementManager.js
│   │   ├── AudioManager.js
│   │   ├── SaveManager.js
│   │   ├── LocalizationManager.js
│   │   └── NetworkManager.js
│   │
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Customer.js
│   │   ├── Ingredient.js
│   │   ├── Recipe.js
│   │   └── Equipment.js
│   │
│   ├── minigames/
│   │   ├── ChopGame.js
│   │   ├── MeasureGame.js
│   │   ├── MixGame.js
│   │   ├── TemperatureGame.js
│   │   ├── TimingGame.js
│   │   ├── SortingGame.js
│   │   ├── RouteGame.js
│   │   ├── DataGame.js
│   │   ├── ProbabilityGame.js
│   │   └── CashierGame.js
│   │
│   ├── questions/
│   │   ├── questionLoader.js
│   │   ├── questionGenerator.js
│   │   ├── validators.js
│   │   ├── generators/
│   │   │   ├── quadratic.js
│   │   │   ├── numberBases.js
│   │   │   ├── logic.js
│   │   │   ├── sets.js
│   │   │   ├── graphTheory.js
│   │   │   ├── inequalities.js
│   │   │   ├── motion.js
│   │   │   ├── statistics.js
│   │   │   ├── probability.js
│   │   │   └── finance.js
│   │   └── data/
│   │       ├── chapter01.json
│   │       ├── chapter02.json
│   │       ├── chapter03.json
│   │       ├── chapter04.json
│   │       ├── chapter05.json
│   │       ├── chapter06.json
│   │       ├── chapter07.json
│   │       ├── chapter08.json
│   │       ├── chapter09.json
│   │       └── chapter10.json
│   │
│   ├── data/
│   │   ├── recipes.json
│   │   ├── ingredients.json
│   │   ├── equipment.json
│   │   ├── missions.json
│   │   ├── achievements.json
│   │   └── worlds.json
│   │
│   ├── locales/
│   │   ├── en.json
│   │   └── ms.json
│   │
│   ├── ui/
│   │   ├── buttons.js
│   │   ├── panels.js
│   │   ├── progressBar.js
│   │   ├── starRating.js
│   │   ├── coinDisplay.js
│   │   └── notification.js
│   │
│   └── utils/
│       ├── mathUtils.js
│       ├── random.js
│       ├── formatting.js
│       └── validation.js
│
├── assets/
│   ├── characters/
│   ├── kitchens/
│   ├── ingredients/
│   ├── recipes/
│   ├── ui/
│   ├── backgrounds/
│   ├── particles/
│   ├── audio/
│   └── fonts/
│
├── server/
│   ├── server.js
│   ├── rooms.js
│   ├── gameState.js
│   └── socketHandlers.js
│
└── tests/
    ├── questions/
    ├── economy/
    ├── missions/
    └── multiplayer/
```

---

# 43. PHASER GAME CONFIG

Use:

```javascript
const config = {
    type: Phaser.AUTO,

    width: 1280,
    height: 720,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },

    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        RestaurantScene,
        WorldMapScene,
        MissionSelectScene,
        CookingScene,
        MathChallengeScene,
        MiniGameScene,
        ResultScene
    ]
};
```

---

# 44. RESPONSIVE DESIGN

The game must work on:

```text
1280 × 720 desktop
1920 × 1080 desktop
1366 × 768 laptop
Chromebook
iPad/tablet
mobile
```

Do not assume desktop-only interaction.

All important actions must support:

```text
mouse
touch
keyboard
```

---

# 45. ACCESSIBILITY

Include:

- readable text
- high contrast
- large buttons
- colour-independent feedback
- keyboard controls
- reduced-motion option
- sound toggle
- music toggle
- language selection

Never make colour alone the only indicator of correct/wrong.

---

# 46. SAVE SYSTEM

For offline prototype:

```javascript
localStorage
```

Save:

```text
player profile
XP
coins
stars
unlocked worlds
completed missions
recipes
equipment
settings
language
```

For school deployment with accounts, migrate progress to a backend.

---

# 47. OFFLINE-FIRST DESIGN

The basic single-player game should work without an internet connection after assets are loaded.

Multiplayer requires internet.

This allows the teacher to use the game even when network conditions are not perfect.

---

# 48. PERFORMANCE TARGET

Target:

```text
60 FPS
```

Avoid unnecessarily large images.

Use:

```text
WebP
compressed PNG
sprite sheets
audio compression
lazy loading
```

---

# 49. ART DIRECTION

Visual style:

**Cute modern Malaysian cartoon**

Use:

- rounded shapes
- expressive characters
- colourful food
- Malaysian restaurant environments
- clear UI
- large icons
- subtle animations

Avoid directly copying Cooking Mama.

Create original:

- characters
- logos
- backgrounds
- animations
- sound effects

---

# 50. SOUND DESIGN

Categories:

```text
button click
correct answer
wrong answer
coin
XP
level up
cooking
chopping
frying
serving
customer happy
customer unhappy
mission complete
boss battle
```

Music should be light and non-distracting.

---

# 51. MATH FEEDBACK DESIGN

Correct:

```text
✓ NICE WORK!
```

Then show the mathematical reasoning.

Wrong:

```text
TRY AGAIN!
```

Then:

```text
Hint:
Start by identifying what the unknown represents.
```

Never simply say:

```text
Wrong.
```

---

# 52. EXPLANATION SYSTEM

Every question must contain an explanation.

Example:

```json
{
  "answer": 6,
  "solutionSteps": [
    "Let the width be x.",
    "The length is x + 4.",
    "Area = x(x + 4).",
    "x(x + 4) = 48.",
    "x² + 4x - 48 = 0.",
    "(x + 8)(x - 6) = 0.",
    "Therefore x = 6."
  ]
}
```

---

# 53. QUESTION QUALITY CONTROL

Before a question enters the game:

```text
1. Validate syntax.
2. Validate answer.
3. Validate solution.
4. Validate distractors.
5. Validate chapter.
6. Validate difficulty.
7. Validate language.
8. Validate mathematical notation.
```

Create:

```javascript
validateQuestion(question)
```

It must return:

```javascript
{
    valid: true,
    errors: []
}
```

or:

```javascript
{
    valid: false,
    errors: [...]
}
```

---

# 54. SAMPLE QUESTION DATABASE

## Chapter 1

```json
{
  "id": "C01-001",
  "chapter": 1,
  "topic": "quadratic_equation",
  "difficulty": "easy",
  "type": "numeric_input",
  "context": "pancake_tray",
  "question": "A rectangular tray has area 48 cm². Its width is x cm and its length is x + 4 cm. Find x.",
  "answer": 6,
  "unit": "cm",
  "xp": 50,
  "coins": 30
}
```

## Chapter 2

```json
{
  "id": "C02-001",
  "chapter": 2,
  "topic": "number_bases",
  "difficulty": "easy",
  "type": "multiple_choice",
  "question": "Convert 1011₂ to base 10.",
  "options": [9,10,11,12],
  "answer": 11,
  "xp": 50,
  "coins": 30
}
```

## Chapter 3

```json
{
  "id": "C03-001",
  "chapter": 3,
  "topic": "logical_reasoning",
  "difficulty": "easy",
  "type": "true_false",
  "question": "If a customer orders nasi lemak, then the customer receives rice.",
  "answer": true,
  "xp": 50,
  "coins": 30
}
```

## Chapter 4

```json
{
  "id": "C04-001",
  "chapter": 4,
  "topic": "intersection",
  "difficulty": "easy",
  "type": "multiple_choice",
  "question": "Set A contains customers who like spicy food. Set B contains customers who like noodles. Which operation represents customers who like both?",
  "options": ["A ∪ B", "A ∩ B", "A'", "B'"],
  "answer": "A ∩ B",
  "xp": 50,
  "coins": 30
}
```

## Chapter 5

```json
{
  "id": "C05-001",
  "chapter": 5,
  "topic": "network",
  "difficulty": "medium",
  "type": "route_selection",
  "question": "Select the shortest delivery route.",
  "network": {
    "A": {
      "B": 4,
      "C": 7
    },
    "B": {
      "D": 3
    },
    "C": {
      "D": 2
    }
  },
  "answer": ["A","B","D"],
  "xp": 100,
  "coins": 60
}
```

## Chapter 6

```json
{
  "id": "C06-001",
  "chapter": 6,
  "topic": "linear_inequality",
  "difficulty": "medium",
  "type": "graph_selection",
  "question": "Select the feasible region for 2x + y ≤ 10.",
  "answer": "region_below_line",
  "xp": 100,
  "coins": 60
}
```

## Chapter 7

```json
{
  "id": "C07-001",
  "chapter": 7,
  "topic": "motion_graph",
  "difficulty": "medium",
  "type": "graph_interpretation",
  "question": "Which section of the graph represents the customer waiting without movement?",
  "answer": "BC",
  "xp": 100,
  "coins": 60
}
```

## Chapter 8

```json
{
  "id": "C08-001",
  "chapter": 8,
  "topic": "dispersion",
  "difficulty": "medium",
  "type": "numeric_input",
  "question": "Calculate the range of the restaurant's waiting times: 5, 7, 8, 12, 15 minutes.",
  "answer": 10,
  "unit": "minutes",
  "xp": 100,
  "coins": 60
}
```

## Chapter 9

```json
{
  "id": "C09-001",
  "chapter": 9,
  "topic": "combined_probability",
  "difficulty": "medium",
  "type": "fraction_input",
  "question": "A customer chooses one drink and one dessert independently. The probability of choosing tea is 1/2 and the probability of choosing cake is 1/4. Find the probability of choosing both.",
  "answer": "1/8",
  "xp": 100,
  "coins": 60
}
```

## Chapter 10

```json
{
  "id": "C10-001",
  "chapter": 10,
  "topic": "financial_management",
  "difficulty": "medium",
  "type": "numeric_input",
  "question": "A restaurant spends RM800 and earns RM1,000. Calculate the profit.",
  "answer": 200,
  "unit": "RM",
  "xp": 100,
  "coins": 60
}
```

---

# 55. MISSION DATA STRUCTURE

```json
{
  "id": "F4-W10-M12",
  "world": 10,
  "chapter": 10,
  "title": "Food Empire Crisis",
  "difficulty": "master",
  "estimatedTime": 600,
  "questions": [
    "C10-101",
    "C10-102",
    "C10-103",
    "C10-104"
  ],
  "requiredSkills": [
    "budgeting",
    "profit",
    "financial_planning"
  ],
  "rewards": {
    "xp": 500,
    "coins": 1000,
    "stars": 3
  }
}
```

---

# 56. RECIPE DATA

```json
{
  "id": "nasi_lemak",
  "name": "Nasi Lemak",
  "category": "main",
  "unlockLevel": 1,
  "ingredients": [
    {
      "id": "rice",
      "quantity": 200,
      "unit": "g"
    },
    {
      "id": "coconut_milk",
      "quantity": 100,
      "unit": "ml"
    }
  ],
  "baseCost": 4.5,
  "sellingPrice": 8,
  "cookingTime": 90,
  "mathTopics": [
    "ratio",
    "financial_management"
  ]
}
```

---

# 57. GAME STATE

Use a centralized state object:

```javascript
const gameState = {
    player: {},
    restaurant: {},
    inventory: {},
    progress: {},
    currentMission: null,
    currentQuestion: null,
    score: 0,
    stars: 0,
    xp: 0,
    coins: 0,
    language: "ms",
    multiplayer: {
        connected: false,
        roomId: null,
        players: []
    }
};
```

Do not allow random scenes to directly mutate unrelated systems.

Use managers.

---

# 58. DEVELOPMENT PHASES

## PHASE 1 — PLAYABLE PROTOTYPE

Build only:

```text
Main Menu
Restaurant
1 Recipe
1 Cooking Mini-game
10 Maths Questions
Result Screen
XP
Coins
Stars
Save System
```

Target:

**Playable in 1–2 weeks of development.**

---

## PHASE 2 — CURRICULUM FOUNDATION

Add:

```text
10 chapters
100+ questions
10 mini-games
World Map
Mission System
Recipe System
```

---

## PHASE 3 — FULL CAMPAIGN

Add:

```text
120 missions
10 boss missions
restaurant upgrades
character customization
achievements
daily challenge
```

---

## PHASE 4 — MULTIPLAYER

Add:

```text
room system
2-player co-op
4-player co-op
classroom mode
```

---

## PHASE 5 — TEACHER SYSTEM

Add:

```text
teacher dashboard
class codes
progress analytics
challenge creation
question selection
```

---

# 59. DEVELOPMENT PRIORITY

DO NOT attempt to build everything simultaneously.

Build in this order:

```text
1. Core Phaser engine
2. Player movement/input
3. Restaurant scene
4. Cooking mini-game
5. Question engine
6. One complete mission
7. Result/XP/coins
8. Save system
9. 10 chapters
10. Content expansion
11. Multiplayer
12. Teacher dashboard
```

---

# 60. MVP DEFINITION

The MVP is complete when a student can:

```text
Open game
↓
Create profile
↓
Enter restaurant
↓
Choose Nasi Lemak
↓
Start mission
↓
Solve mathematics question
↓
Complete cooking mini-game
↓
Serve customer
↓
Receive stars
↓
Receive XP
↓
Receive coins
↓
Upgrade kitchen
↓
Play another mission
```

---

# 61. ANTI-CHEATING / QUESTION RANDOMISATION

Each attempt should randomise:

- numbers
- ingredient quantities
- customer data
- prices
- graph values
- probability values

But the mathematical structure must remain valid.

Example:

```javascript
generateQuadraticQuestion({
    difficulty: "medium",
    integerRoots: true,
    context: "restaurant"
});
```

---

# 62. EDUCATIONAL ANALYTICS

Track:

```text
question attempts
correct attempts
incorrect attempts
hint usage
time per question
chapter mastery
mission completion
```

Calculate:

```text
Mastery =
correct questions / attempted questions
```

Do not expose unnecessary student personal information.

Use anonymous/player IDs where possible.

---

# 63. TEACHER ANALYTICS EXAMPLE

```text
CLASS 4S1

Chapter 1
████████░░ 82%

Chapter 2
███████░░░ 71%

Chapter 3
█████████░ 91%

Chapter 4
██████░░░░ 63%

Chapter 5
███████░░░ 74%

Chapter 6
█████░░░░░ 58%

...
```

Teacher can identify topics needing revision.

---

# 64. GAME DESIGN PRINCIPLE

The game must follow:

### Mathematics → Action → Consequence

Not:

### Mathematics → Question → Answer

Example:

```text
Student calculates that 15 meals can be prepared.
        ↓
Kitchen actually prepares 15 meals.
        ↓
Customer orders 15.
        ↓
Restaurant earns money.
```

The mathematics must change the game world.

---

# 65. NO FAKE EDUCATIONAL WRAPPER

Avoid:

```text
Cooking animation
↓
Random maths question
↓
Cooking animation
```

Instead:

```text
Math calculation determines ingredient quantity.
Math calculation determines cooking time.
Math calculation determines price.
Math calculation determines delivery route.
Math calculation determines profit.
```

Mathematics must affect gameplay.

---

# 66. CODE QUALITY REQUIREMENTS

The coding AI must:

- use modular architecture
- use ES modules
- avoid global variables
- use classes where appropriate
- document public APIs
- validate input
- handle errors gracefully
- avoid duplicated code
- separate content from engine
- write reusable components
- write unit tests
- maintain consistent naming
- avoid giant files

Target:

```text
No scene > approximately 500 lines
No manager responsible for unrelated systems
No hard-coded question bank inside scenes
```

---

# 67. TESTING REQUIREMENTS

Create tests for:

### Mathematics

```text
quadratic answer validation
number-base conversion
set operations
probability calculations
financial calculations
```

### Game

```text
mission completion
XP calculation
coin calculation
star calculation
unlocking
saving/loading
```

### Multiplayer

```text
room creation
joining
disconnect
reconnect
state synchronisation
mission completion
```

---

# 68. SECURITY

Never expose:

```text
database service keys
admin keys
teacher credentials
private API keys
server secrets
```

Frontend contains only public configuration.

All sensitive operations happen server-side.

---

# 69. DEPLOYMENT

Initial deployment:

```text
GitHub
   ↓
Netlify
   ↓
math-mama.netlify.app
```

Potential production:

```text
Frontend
Netlify/Vercel

Backend
Render/Railway

Database
Supabase

Realtime
Socket.IO
```

---

# 70. VERSIONING

Use:

```text
v0.1 — Prototype
v0.2 — Cooking System
v0.3 — Question Engine
v0.4 — Full Form 4 Content
v0.5 — Restaurant Economy
v0.6 — Multiplayer Prototype
v0.7 — Classroom Mode
v0.8 — Teacher Dashboard
v0.9 — Beta
v1.0 — Form 4 Release
```

---

# 71. MASTER CONTENT TARGET

Final release should contain at least:

```text
10 Worlds
120 Missions
10 Boss Missions
300+ Mathematics Questions
10 Cooking Mini-games
15+ Recipes
20+ Ingredients
15+ Equipment upgrades
20+ Achievements
2 Languages
2-player mode
4-player mode
Classroom challenge mode
Teacher dashboard
```

The initial 120 missions provide the campaign structure.

The 300+ questions provide replayability.

---

# 72. REPLAYABILITY

A mission should not become useless after completion.

Use:

```text
Random numbers
Random customers
Random ingredients
Random prices
Random order combinations
Random probability events
```

Therefore:

```text
Mission 1
Attempt 1 → Question A

Attempt 2 → Question B

Attempt 3 → Question C
```

Same learning objective, different problem.

---

# 73. FINAL GAME EXPERIENCE

A student should feel:

> "I'm playing a restaurant game."

The teacher should know:

> "They are practising Form 4 Mathematics."

The student should gradually discover:

> "Actually, I can't run my restaurant unless I understand the mathematics."

That is the central design philosophy.

---

# 74. MASTER PROMPT FOR CODING AI

Use the following as the initial instruction to the coding AI:

---

## BUILD MATH MAMA: WARUNG MATEMATIK

You are the lead game developer, educational game designer, Phaser.js architect and curriculum-content engineer.

Build a production-quality HTML5 educational game called:

**MATH MAMA: WARUNG MATEMATIK**

The game is a cooking simulation and restaurant-management game designed for Malaysian Form 4 students studying KSSM Mathematics.

The game must cover all 10 Form 4 KSSM Mathematics chapters:

1. Fungsi dan Persamaan Kuadratik dalam Satu Pemboleh Ubah
2. Asas Nombor
3. Penaakulan Logik
4. Operasi Set
5. Rangkaian dalam Teori Graf
6. Ketaksamaan Linear dalam Dua Pemboleh Ubah
7. Graf Gerakan
8. Sukatan Serakan Data Tak Terkumpul
9. Kebarangkalian Peristiwa Bergabung
10. Matematik Pengguna: Pengurusan Kewangan

The game must be inspired by cooking simulation gameplay but must use completely original characters, artwork, UI, sound and branding.

Do not copy Cooking Mama assets, characters, music, animations, UI or branding.

TECHNOLOGY:

- Phaser 3
- JavaScript ES modules or TypeScript
- Vite
- HTML5
- CSS
- responsive design
- localStorage for offline prototype
- Socket.IO architecture for future multiplayer
- JSON-driven question database

ARCHITECTURE:

Use modular architecture.

Separate:

- scenes
- managers
- entities
- questions
- question generators
- recipes
- missions
- mini-games
- localization
- UI
- networking
- save system

Do not create one giant JavaScript file.

FIRST IMPLEMENT:

1. BootScene
2. PreloadScene
3. MainMenuScene
4. RestaurantScene
5. WorldMapScene
6. MissionSelectScene
7. CookingScene
8. MathChallengeScene
9. ResultScene

Create one fully playable recipe:

**NASI LEMAK**

The player should:

1. enter restaurant
2. choose Nasi Lemak
3. begin mission
4. receive a Form 4 mathematics challenge
5. solve the challenge
6. complete cooking mini-game
7. serve customer
8. calculate result
9. receive XP
10. receive coins
11. receive stars
12. unlock an upgrade

After this vertical slice works, expand the system rather than duplicating code.

QUESTION SYSTEM:

Questions must be stored separately from scenes.

Create:

```text
src/questions/data/chapter01.json
...
src/questions/data/chapter10.json
```

Every question must include:

- id
- chapter
- topic
- difficulty
- type
- question
- answer
- explanation
- XP
- coins
- skills

Implement:

```javascript
QuestionManager
QuestionValidator
QuestionGenerator
```

Create procedural generators for all 10 chapters.

All generated questions must be mathematically valid.

Every wrong answer should correspond to a plausible mathematical misconception where possible.

COOKING SYSTEM:

Implement reusable mini-games:

1. Chop
2. Measure
3. Mix
4. Temperature
5. Timing
6. Sorting
7. Route
8. Data Analysis
9. Probability
10. Cashier

Mathematics must affect the actual gameplay.

Do NOT merely display a mathematics quiz between cooking animations.

Example:

If the student calculates 500 g of flour, the cooking system should actually use 500 g.

If the student calculates a delivery route, the game should use that route.

If the student calculates a selling price, the restaurant economy should use that price.

PROGRESSION:

Implement:

- XP
- coins
- stars
- missions
- recipes
- restaurant upgrades
- equipment
- achievements
- world unlocking

Create:

10 worlds
120 missions
10 boss missions

Initially implement the complete data architecture and sample missions, then progressively populate all content.

RESTAURANT ECONOMY:

Implement:

```text
ingredient cost
operating cost
selling price
revenue
profit
loss
budget
cash flow
savings
loan
```

Use Malaysian Ringgit (RM).

MULTIPLAYER:

Design architecture for:

- 2-player cooperative mode
- 4-player cooperative mode
- classroom challenge mode

Use Socket.IO architecture.

Create:

```text
room creation
room joining
room code
ready state
player state
game state
mission state
result state
disconnect handling
```

For the first prototype, local/shared-screen multiplayer can be implemented before online multiplayer.

CLASSROOM:

Create a future-compatible classroom mode:

```text
Teacher creates class challenge
↓
Students join with class code
↓
Teacher selects chapter
↓
Teacher selects difficulty
↓
Students play
↓
Teacher receives results
```

TEACHER ANALYTICS:

Track:

- missions completed
- question attempts
- accuracy
- hints used
- chapter mastery
- average time
- common errors

Do not collect unnecessary personal information.

LOCALIZATION:

Use:

```text
/locales/en.json
/locales/ms.json
```

Default language:

Bahasa Melayu.

Do not hard-code interface text into scenes.

ACCESSIBILITY:

Support:

- keyboard
- mouse
- touch
- large controls
- readable fonts
- high contrast
- reduced motion
- sound toggle
- music toggle

PERFORMANCE:

Target 60 FPS.

Use:

- sprite sheets
- compressed images
- lazy loading
- efficient Phaser objects
- object pooling where useful

TESTING:

Create unit tests for:

- question validation
- quadratic calculations
- number-base calculations
- set operations
- probability
- statistics
- financial calculations
- XP
- coins
- stars
- progression
- save/load

IMPORTANT DEVELOPMENT RULE:

Do not attempt to create the complete 120-mission game in one huge implementation step.

Use this sequence:

PHASE 1:
Create the playable vertical slice.

PHASE 2:
Complete the question engine.

PHASE 3:
Add all 10 curriculum worlds.

PHASE 4:
Add restaurant progression.

PHASE 5:
Add 120 missions.

PHASE 6:
Add multiplayer.

PHASE 7:
Add classroom/teacher dashboard.

At the end of every phase:

- run the game
- test the main gameplay loop
- fix errors
- verify mathematical calculations
- verify scene transitions
- verify save/load
- verify responsive layout

Do not move to the next major phase until the previous phase is playable.

The final game should feel like a genuine cooking/restaurant game where mathematics is embedded into the gameplay rather than a quiz disguised as a game.

Core philosophy:

**COOK → CALCULATE → ACT → EARN → UPGRADE → MASTER MATHEMATICS**

Start by building the complete Phase 1 vertical slice now.