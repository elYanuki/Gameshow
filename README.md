# Gameshow

NodeJS based Gameshow

**version: V3.1**

4 main pages
- display: 
  - nicely styled clean view of the gameboard
  - intendet to be streamed to a tv or simmilar
  - offers no controll over the game
- master:
  - intendet to be used on the hosts phone
  - offers full controll over the game
    - create and delete players
    - change player scores
    - open questions
    - start the timer
    - hide and show rules and category overview
  - can see the answers to all questions
- player:
  - nicely styled limeted view of the game
  - intendet to be used on the players phones to submitt awnsers to certain question types
  - login as a existing player or create a new one
  - the last used player is saved for auto login
- editmode:
  - select questionboard to edit and change all parts of the game
  - change the type of each question
    - default: question and answer
    - image: question, answer and one as the "question-image" and a "solution-image"
    - multiple choice: question, answer and 4 answer options
  - change FreeForAll questions
    - FFA gets called after every player chose a question once
    - everyone can give an answer to the FFA on their own phone one the player page
  - not yet functional on mobile

---

![image](https://user-images.githubusercontent.com/70104756/193749890-80727808-8d49-439a-aeb2-f95de4d4ac04.png)
*Display view of the gameshow*

![editmode](https://user-images.githubusercontent.com/70104756/211500452-baa098ea-c538-462d-a799-32831ade0b8f.jpg)
*Editmode while changing content of a question in the gameboard "yaniks fun thing"*


