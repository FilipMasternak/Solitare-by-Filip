
class Card {
    constructor(figure, value, link, color, index){
        this.figure = figure;
        this.value = value;
        this.link = link;
        this.color = color;
        this.index = index  
    }
};

class Deck {
    constructor(){
        this.cards = [];
        
    }

    createCards = () => {
        const figures = [2,3,4,5,6,7,8,9, 10, 'jack', 'queen', 'king', 'ace'];
        const values = ['hearts', 'clubs', 'diamonds', 'spades'];

        figures.forEach((figure, index) => {
            values.forEach(value => {
                let color = 'red';
                if(value === 'spades' || value === 'clubs'){
                    color = 'black';
                }
                this.cards.push(new Card(figure, value, `${figure}_of_${value}.png`, color, index))
            })
        })
    };

    shuffle = () => {
        for(let i = 0; i < 10; i++){
            this.cards.sort(()=>  Math.random() - 0.5)
        }
    };
};

class Game {
    constructor(){
        this.deck = new Deck();
        this.movement = new Movement();
        this.currentStackIndex = 0;
        this.stackElement = document.querySelector('.stack');
        this.wasteElement = document.querySelector('.waste');
        this.lowerDecks = document.querySelectorAll('.lowerdeck');
        this.upperDecks = document.querySelectorAll('.upperdeck');
        this.initEvents();
        this.timeCounter = document.querySelector('.clock');
        this.stopWatch = document.querySelector('.timer');
        document.querySelector('.reset').addEventListener('click', this.resetGame);
        this.gameSeconds = 0; 
    };

    resetGame = () =>{
        document.querySelector('.stack').innerHTML = "";
        document.querySelector('.waste').innerHTML = "";
        document.querySelectorAll('.upperdeck').forEach((el)=>{
            el.innerHTML = "";
        })
        this.gameSeconds = 0;
        this.initCards();
    };

    timer = () => {
        setInterval(()=>{
            this.gameSeconds++;
            const min = Math.floor(this.gameSeconds / 60);
            const sec = Math.floor(this.gameSeconds - min * 60);     
            const stopWatchSeconds = sec < 10 ? `0`+ sec : sec;
            const stopWatchMinute = min < 10 ? `0` + min : min;
            this.stopWatch.innerHTML = `${stopWatchMinute}:${stopWatchSeconds}`;
        },1000)
    };
   
    clock = () =>{        
        setInterval(() =>{
            let time = new Date();
            this.hours = time.getHours();
            this.minutes = time.getMinutes();
            this.seconds = time.getSeconds();
           
        if (this.hours < 10){
            this.hours = '0' + this.hours;
        }
        if (this.minutes < 10) {
            this.minutes = '0' + this.minutes;
        }
        if (this.seconds < 10){
            this.seconds = '0' + this.seconds;
        }
        this.timeCounter.innerHTML = `${this.hours}:${this.minutes}:${this.seconds}`;
        },1000) 
    };

    initCards = () =>{
        this.gameOver = true;
        this.deck.createCards();
        this.deck.shuffle(); 
        this.lowerDecks.forEach((lowerDeck, index) =>{
            for(let i = 0; i < index + 1; i++){
                const card = document.createElement('img');
                card.src = `/cards/${this.deck.cards[0].link}`;
                card.style.top = i === 0 ? 0 : `${i * 15}px`;
                
                if(i < index){
                    card.src = `https://res.cloudinary.com/fleetnation/image/private/c_fit,w_1120/g_south,l_text:style_gothic2:%C2%A9%20Valentin,o_20,y_10/g_center,l_watermark4,o_25,y_50/v1518845333/trwc1vdhfbmmw5nb83mo.jpg`;
                }
                card.dataset.info = JSON.stringify(this.deck.cards[0]);
                this.deck.cards.shift();
                card.addEventListener('dragstart', this.movement.dragStartEvent);
                card.addEventListener('drag', this.movement.dragEvent)
                card.addEventListener('dragend', this.movement.dragEndEvent);
                lowerDeck.append(card);
            }
        })
        const card = document.createElement('img');
        card.src = `https://res.cloudinary.com/fleetnation/image/private/c_fit,w_1120/g_south,l_text:style_gothic2:%C2%A9%20Valentin,o_20,y_10/g_center,l_watermark4,o_25,y_50/v1518845333/trwc1vdhfbmmw5nb83mo.jpg`;
        this.stackElement.append(card);
    };

    initDrop = () => {
        this.lowerDecks.forEach((lowerdeck) => {
            lowerdeck.addEventListener('dragover', this.movement.dragOverEvent);
            lowerdeck.addEventListener('drop', (e) => this.movement.dragToLowerDeckEvent(e, this.deck));
        })
        this.upperDecks.forEach((upperdeck) => {
            upperdeck.addEventListener('dragover', this.movement.dragOverEvent);
            upperdeck.addEventListener('drop', (e) => this.movement.dragToUpperDeckEvent(e, this.deck));
        })
    };

    initEvents = () => {
        
        this.stackElement.addEventListener('click', this.moveToWaste);
        this.initDrop();
        this.clock();
        this.timer();
    };

    moveToWaste = () => {
        this.wasteElement.innerHTML = "";
        const cardToWaste = document.createElement('img');
        cardToWaste.src = `/cards/${this.deck.cards[this.currentStackIndex].link}`;
        cardToWaste.dataset.info = JSON.stringify(this.deck.cards[this.currentStackIndex]);
        cardToWaste.addEventListener('dragstart', this.movement.dragStartEvent);
        cardToWaste.addEventListener('dragend', this.movement.dragEndEvent);
        this.wasteElement.append(cardToWaste);
        this.currentStackIndex++;
        if(this.currentStackIndex === this.deck.cards.length){
            this.currentStackIndex = 0;
        }
    };
};

class Movement {
    dragStartEvent = (e) =>{
        this.offset = e.clientX - e.target.getBoundingClientRect().left;
        e.dataTransfer.setData('application/json', e.target.dataset.info); 
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.dropEffect = 'move';
    };

    dragEvent = e => {
        const parentLowerdeck = e.target.closest('.lowerdeck');
        const allChilds = [...parentLowerdeck.querySelectorAll('img')];
        const currentCardIndex = allChilds.indexOf(e.target);
        const nextCards = allChilds.filter((item, index) => index > currentCardIndex);

        nextCards.forEach((item, index) => {
            item.dataset.moved = "true";
            item.style.position = 'fixed';
            item.style.left = `${e.clientX - this.offset}px`;
            item.style.top = `${index * 15 + e.clientY + 15}px`;
        })
    };

    dragEndEvent = (e) =>{
        const parentLowerdeck = e.target.closest('.lowerdeck');
        const allChilds = [...parentLowerdeck.querySelectorAll('img')];
        const currentCardIndex = allChilds.indexOf(e.target);
        const nextCards = allChilds.filter((item, index) => index > currentCardIndex);

        let startTop = parseInt(e.target.style.top.replace('px', ''))

        nextCards.forEach((item, index) => {
            item.dataset.moved = "false";
            item.style.position = 'absolute';
            item.style.left = e.target.style.left;
            item.style.top = `${index * 15 + 15 + startTop}px`;
        })
    };

    dragOverEvent = (e) =>{
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    dragToLowerDeckEvent = (e, deck) =>{
        const movedCardInfo = JSON.parse(e.dataTransfer.getData('application/json'));
        let targetCardInfo = e.target.dataset.info;
                
        if(targetCardInfo !== undefined ){
            targetCardInfo = JSON.parse(targetCardInfo)
        }

        if ((targetCardInfo && targetCardInfo.color !== movedCardInfo.color && movedCardInfo.index + 1 === targetCardInfo.index) || targetCardInfo === undefined){
            const movedCard = document.querySelector(`img[src="/cards/${movedCardInfo.link}"]`);
            const parentLowerdeck = movedCard.closest('.lowerdeck');

            movedCard.style.top = (e.currentTarget.children.length * 15) + "px";
            e.currentTarget.appendChild(movedCard);

            if(parentLowerdeck){
                const currentDeckCards = parentLowerdeck.querySelectorAll('img');
                if(currentDeckCards[currentDeckCards.length - 1].src !== movedCard.src){
                    const movedCards = document.querySelectorAll('[data-moved="true"]');
                    movedCards.forEach(item => {
                        e.currentTarget.appendChild(item);
                    })
                } 
            }
            if(parentLowerdeck){
                const currentDeckCards = parentLowerdeck.querySelectorAll('img');
                const nextCardInfo = JSON.parse(currentDeckCards[currentDeckCards.length - 1].dataset.info);
                currentDeckCards[currentDeckCards.length - 1].src = `/cards/${nextCardInfo.link}`
            }
        }
    };

    dragToUpperDeckEvent = (e, deck) => {
        const movedCardInfo = JSON.parse(e.dataTransfer.getData('application/json'));
        let targetCardInfo = e.target.dataset.info;
        if(targetCardInfo){
            targetCardInfo = JSON.parse(e.target.dataset.info);
        }
        if((targetCardInfo === undefined  && movedCardInfo.figure === 'ace')){

            const movedCard = document.querySelector(`img[src="/cards/${movedCardInfo.link}"]`);
            const parentLowerdeck = movedCard.closest('.lowerdeck');
            movedCard.style.top = 0;
            e.target.appendChild(movedCard);
            deck.cards = deck.cards.filter(card => card.link !== movedCardInfo.link);
            if(parentLowerdeck){
                const currentDeckCards = parentLowerdeck.querySelectorAll('img');
                const nextCardInfo = JSON.parse(currentDeckCards[currentDeckCards.length - 1].dataset.info);
                currentDeckCards[currentDeckCards.length - 1].src = `/cards/${nextCardInfo.link}`
            }
        }
        else if(targetCardInfo.value === movedCardInfo.value && targetCardInfo.figure === 'ace' && movedCardInfo.figure === 2){
            const movedCard = document.querySelector(`img[src="/cards/${movedCardInfo.link}"]`);
            const parentLowerdeck = movedCard.closest('.lowerdeck');
            movedCard.style.top = 0;
            e.target.parentNode.appendChild(movedCard);
            deck.cards = deck.cards.filter(card => card.link !== movedCardInfo.link); 
            if(parentLowerdeck){
                const currentDeckCards = parentLowerdeck.querySelectorAll('img');
                const nextCardInfo = JSON.parse(currentDeckCards[currentDeckCards.length - 1].dataset.info);
                currentDeckCards[currentDeckCards.length - 1].src = `/cards/${nextCardInfo.link}`
            }
        }
        else if(targetCardInfo.value === movedCardInfo.value && movedCardInfo.index - 1  === targetCardInfo.index){
            const movedCard = document.querySelector(`img[src="/cards/${movedCardInfo.link}"]`);
            const parentLowerdeck = movedCard.closest('.lowerdeck');

            movedCard.style.top = 0;
            e.target.parentNode.appendChild(movedCard);
            deck.cards = deck.cards.filter(card => card.link !== movedCardInfo.link);

            if(parentLowerdeck){
                const currentDeckCards = parentLowerdeck.querySelectorAll('img');
                const nextCardInfo = JSON.parse(currentDeckCards[currentDeckCards.length - 1].dataset.info);
                currentDeckCards[currentDeckCards.length - 1].src = `/cards/${nextCardInfo.link}`
            }
        }
    }
    
};
const game = new Game()
game.initCards()



