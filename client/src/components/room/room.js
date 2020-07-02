import React, { Component, useState } from 'react'
import socketIOClient from 'socket.io-client'
import Swal from 'sweetalert2'
import { Card, HandStyles, CardStyles, Hand } from 'react-casino'
import socket from 'socket.io-client/lib/socket'

const ENDPOINT = 'http://127.0.0.1:5000'

function resultInWords(x) {
    let num
    if (x % 5 === 0) {
        num = x / 5
    } else {
        num = Math.floor(x / 5) + 1
    }
    let suit
    if (x % 5 === 0) {
        suit = 'No trump'
    } else if (x % 5 === 1) {
        suit = 'Diamond'
    } else if (x % 5 === 2) {
        suit = 'Club'
    } else if (x % 5 === 3) {
        suit = 'Heart'
    } else if (x % 5 === 4) {
        suit = 'Spade'
    }
    return num + ' ' + suit
}

const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
    },
    buttonsStyling: false,
})

class Room extends Component {
    constructor(props) {
        super(props)
        const {
            match: { params },
        } = props

        this.state = {
            board: [],
            selected: new Set(),
            deck: {}, // this one we need to link with backend and also react-casino
            collected: new Set(),
            socket: socketIOClient(ENDPOINT),
            roomId: '',
            displayStart: true,
            hand: [], //represents hand of client
            //curr highest bid
            currHighest: '0',
            //id of socket that called the curr highest bid
            calledBy: '',
            //sockets that are ready (previously needed to click startGame)
            //current: just need to pass on the calling
            isReady: new Set(),
            needToWin: '7',
            partner: '',
        }
    }

    //start componentdidmount=============================================================================================

    componentDidMount() {
        //this.RoomConfigurator()

        function cardFaceRank(FS) {

            const F = FS.slice(0, 1)
            let faceValue

            if (F === '2') {
                faceValue = 0
            } else if (F === '3') {
                faceValue = 1
            } else if (F === '4') {
                faceValue = 2
            } else if (F === '5') {
                faceValue = 3
            } else if (F === '6') {
                faceValue = 4
            } else if (F === '7') {
                faceValue = 5
            } else if (F === '8') {
                faceValue = 6
            } else if (F === '9') {
                faceValue = 7
            } else if (F === 'T') {
                faceValue = 8
            } else if (F === 'J') {
                faceValue = 9
            } else if (F === 'Q') {
                faceValue = 10
            } else if (F === 'K') {
                faceValue = 11
            } else if (F === 'A') {
                faceValue = 12
            }

            return faceValue
        }

        function cardSuitRank(FS) {

            const S = FS.slice(1,)
            let suitValue

            if (S === 'S') {
                suitValue = 3
            } else if (S === 'H') {
                suitValue = 2
            } else if (S === 'C') {
                suitValue = 1
            } else if (S === 'D') {
                suitValue = 0
            }

            return suitValue
        }


        //copied, bides time in ms
        function sleep(time) {
            return new Promise((resolve) => setTimeout(resolve, time))
        }

        //previously in dealQuery
        this.state.socket.on('dealHand', (hand) => {
            this.setState({
                hand: hand,
            })
            console.log(
                `${this.state.socket.id} rec'd hando of ${this.state.hand}`
            )
        })

        //previously in dealHand
        this.state.socket.on('cardSelected', (userFS) => {
            console.log(userFS)
            //setState for the selecteed cards
            this.setState({
                selected: this.state.selected.add(userFS),
            })

            //delays 3000 ms 
            sleep(3000).then(() => {
                //if there are 4 cards in selected, evaluate and assign winner of set
                if (this.state.selected.size === 4) {

                    const winningSuit = this.state.currHighest % 5

                    let isHighSuit

                    let winner

                    let highestInSet = 0

                    console.log(`winning suit: ` + winningSuit)
                    for (let userFS of this.state.selected) {
                        console.log(userFS.slice(21,))
                    }

                    if (winningSuit === 0) {
                        //no trump suit

                        //iterates thru Set 'selected', converts cards into the rank and updates winner and highestInSet
                        //when there is a higher ranking card  
                        for (let userFS of this.state.selected) {
                            const user = userFS.slice(0, 20)
                            const FS = userFS.slice(20,)
                            const FSrank = cardSuitRank(FS) * 13 + cardFaceRank(FS)
                            if (FSrank > highestInSet) {
                                winner = user
                                highestInSet = FSrank
                            }
                        }


                    } else if (winningSuit === 1) {
                        //diamond trump
                        isHighSuit = new Set([...this.state.selected].filter(userFS => (userFS.slice(21,) === 'D')))
                        console.log(isHighSuit)
                        for (let userFS of isHighSuit) {
                            const user = userFS.slice(0, 20)
                            const FS = userFS.slice(20,)
                            const FSrank = cardFaceRank(FS)
                            if (FSrank > highestInSet) {
                                winner = user
                                highestInSet = FSrank
                            }
                        }

                    } else if (winningSuit === 2) {
                        //club trump
                        isHighSuit = new Set([...this.state.selected].filter(userFS => (userFS.slice(21,) === 'C')))
                        console.log(isHighSuit)
                        for (let userFS of isHighSuit) {
                            const user = userFS.slice(0, 20)
                            const FS = userFS.slice(20,)
                            const FSrank = cardFaceRank(FS)
                            if (FSrank > highestInSet) {
                                winner = user
                                highestInSet = FSrank
                            }
                        }

                    } else if (winningSuit === 3) {
                        //heart trump
                        isHighSuit = new Set([...this.state.selected].filter(userFS => (userFS.slice(21,) === 'H')))
                        console.log(isHighSuit)
                        for (let userFS of isHighSuit) {
                            const user = userFS.slice(0, 20)
                            const FS = userFS.slice(20,)
                            const FSrank = cardFaceRank(FS)
                            if (FSrank > highestInSet) {
                                winner = user
                                highestInSet = FSrank
                            }
                        }

                    } else if (winningSuit === 4) {
                        //spade trump
                        isHighSuit = new Set([...this.state.selected].filter(userFS => (userFS.slice(21,) === 'S')))
                        console.log(isHighSuit)
                        for (let userFS of isHighSuit) {
                            const user = userFS.slice(0, 20)
                            const FS = userFS.slice(20,)
                            const FSrank = cardFaceRank(FS)
                            if (FSrank > highestInSet) {
                                winner = user
                                highestInSet = FSrank
                            }
                        }
                    }

                    this.state.socket.emit('winsSet', winner)

                    //clears the set selected and adds the elements to the set collected
                    let newCollected = this.state.collected
                    for (let card of this.state.selected.values()) {
                        newCollected.add(card)
                    }
                    console.log(newCollected)
                    this.setState({
                        collected: newCollected,
                        selected: new Set(),
                    })
                }
            })
        })

        this.state.socket.on('decrementNTW', () => {
            console.log(`sweet sweet decrements`)
            if (this.state.needTowin === 1) {
                this.state.socket.emit('winnerFound', this.state.roomId + this.state.socket.id)
            } else {
                this.setState({
                    needToWin: this.state.needToWin - 0.25,
                })
            }
        })

        //used to be in callProcess=============================================
        this.state.socket.on('isReady', (user) => {
            const newReady = this.state.isReady.add(user)
            this.setState({ isReady: newReady })
            if (this.state.isReady.size === 4) {
                this.startGame(this.state.roomId, user)
            }
        })

        this.state.socket.on('updateHighest', (result) => {
            const calledBy = result.slice(0, 20)
            const newHighest = result.slice(21,)

            this.setState({
                calledBy: calledBy,
                currHighest: newHighest,
            })
            console.log(`updateHighest rec'd: ${newHighest}`)
        })

        this.state.socket.on('startCallFail', () => {
            Swal.fire({
                title: 'Cannot start calling, not enough people',
                timer: 2000
            })
        })

        this.state.socket.on('updateNeedToWin', () => {
            const newNTW = Math.floor(this.state.currHighest / 5) + parseInt(this.state.needToWin)
            this.setState({ needToWin: newNTW })
        })

        this.state.socket.on('selectPartner', () => {
            this.selectPartner()
        })
        //used to be in callProcess=============================================

        //used to be in selectPartner===========================================
        this.state.socket.on('assignPartner', (FS) => {
            console.log('assigning in progress')
            if (this.state.hand.includes(FS)) {
                const newNTW = Math.floor(this.state.currHighest / 5) + parseInt(this.state.needToWin)
                this.setState({ needToWin: newNTW })
            }
        })
        //used to be in selectPartner===========================================

        this.state.socket.on('winPrompt', (user) => {
            if (this.state.socket.id === user) {
                Swal.fire(`Congrats!\nYou beat your friends and they're bad at this game`)
            } else {
                Swal.fire(`Whoops!\n${user} beat your ass teeheexd`)
            }
        })
    }

    //end componentdidmount===============================================================================================

    clickCard = (e, card) => {
        const cardString = JSON.stringify(card)
        console.log(cardString)
        const faes = cardString.slice(9, 10)
        const soot = cardString.slice(20, 21)
        this.state.socket.emit('clickedCard', (this.state.roomId + this.state.socket.id + faes + soot))

        //removes the clicked card from hand upon clicking
        const selectedRemoved = this.state.hand.filter(thing => thing !== (faes + soot))
        this.setState({
            hand: selectedRemoved,
        })
    }

    startGame = (rmid, lastuser) => {
        const {
            match: { params },
        } = this.props
        this.state.socket.emit('startGame', rmid + ' ' + lastuser)
    }

    dealQuery = () => {
        this.state.socket.emit('dealQuery', this.state.roomId)

        this.state.socket.on('playersNeeded', () => {
            Swal.fire({
                title: 'Not enough players yet',
            })
        })
    }

    selectPartner = () => {
        Swal.fire({
            title: 'Select your partner, enter value in [face][suit]',
            input: 'text',
            confirmButtonText: 'Confirm',
        }).then((result) => {
            if (this.state.hand.includes(result.value)) {
                Swal.fire({
                    title: `You cannot select yourself`,
                    timer: 2000,
                })
                //console.log('cannot select yourself as partner')
                this.selectPartner()
            } else if (result.value === '') {
                console.log('no partner selected')
                Swal.fire({
                    title: 'no partner selected',
                    timer: '2000',
                })
                this.selectPartner()
            } else {
                console.log('other partner selected')
                this.state.socket.emit(
                    'partnerQuery',
                    this.state.roomId + ' ' + result.value
                )
            }
        })

    }

    callProcess = () => {
        this.state.socket.emit(
            'callStart',
            this.state.roomId + ' ' + this.state.socket.id
        )
        this.state.socket.on('startCallSuccess', () => {
            Swal.fire({
                title: 'start calling!',
                input: 'select',
                inputOptions: {
                    '0': 'Pass',
                    '1': '1 Diamond',
                    '2': '1 Clubs',
                    '3': '1 Heart',
                    '4': '1 Spade',
                    '5': '1 No trump',
                    '6': '2 Diamond',
                    '7': '2 Clubs',
                    '8': '2 Heart',
                    '9': '2 Spade',
                    '10': '2 No trump',
                    '11': '3 Diamond',
                    '12': '3 Clubs',
                    '13': '3 Heart',
                    '14': '3 Spade',
                    '15': '3 No trump',
                    '16': '4 Diamond',
                    '17': '4 Clubs',
                    '18': '4 Heart',
                    '19': '4 Spade',
                    '20': '4 No trump',
                    '21': '5 Diamond',
                    '22': '5 Clubs',
                    '23': '5 Heart',
                    '24': '5 Spade',
                    '25': '5 No trump',
                },
            }).then((result) => {
                console.log(
                    'result ' +
                    JSON.stringify(result) +
                    ' currHighest: ' +
                    this.state.currHighest
                )
                if (result.isConfirmed) {
                    if (parseInt(result.value, 10) === 0) {
                        this.state.socket.emit(
                            'readyToStart',
                            this.state.socket.id +
                            ' ' +
                            this.state.roomId +
                            ' ' +
                            this.state.isReady.size
                        )
                    } else {
                        if (
                            parseInt(result.value, 10) <=
                            parseInt(this.state.currHighest, 10)
                        ) {
                            Swal.fire({
                                title: `Call something higher than 
                                \n${resultInWords(this.state.currHighest)}`,
                            })
                        } else {
                            this.state.socket.emit(
                                'callResult',
                                this.state.socket.id +
                                ' ' +
                                this.state.roomId +
                                ' ' +
                                result.value.valueOf()
                            )
                        }
                    }
                } else {
                    //need to call the swal again
                }
            })
        })


    }

    //=======================================================================================

    render() {
        const {
            board,
            selected,
            socket,
            roomId,
            hand,
            currHighest,
            calledBy,
            isReady,
            needToWin,
        } = this.state

        //socket listeners======================================================================================

        //======================================================================================================
        const buttonStyle = {
            width: '350px',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '20px',
            fontFamily: 'Josephin Sans',
            background: 'black',
            borderRadius: '5px',
            color: 'white',
            margin: '10px 0px',
            padding: '10px 60px',
            cursor: 'pointer',
        }
        const longButton = {
            width: '700px',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '20px',
            fontFamily: 'Josephin Sans',
            background: 'black',
            borderRadius: '5px',
            color: 'white',
            margin: '10px 0px',
            padding: '10px 60px',
            cursor: 'pointer',
        }

        return (
            <div>
                <div>
                    Welcome, player {this.state.socket.id} to room{' '}
                    {this.state.roomId}
                </div>

                <button
                    style={buttonStyle}
                    onClick={() => {
                        Swal.fire({
                            title: 'You are making your own room',
                            text: 'Room code: ' + this.state.socket.id,
                            confirmButtonText: 'Join room',
                        }).then(() => {
                            this.setState({
                                roomId: this.state.socket.id,
                            })
                            this.state.socket.emit('new_room')
                        })
                    }}
                >
                    Create Room
                </button>

                <button
                    style={buttonStyle}
                    onClick={() => {
                        Swal.fire({
                            title: 'Please enter the room code to join:',
                            input: 'text',
                            confirmButtonText: 'Join',
                            showCancelButton: true,
                            showLoaderOnConfirm: true,
                        }).then((result) => {
                            this.state.socket.emit('joinRoom', result)
                            this.state.socket.on('RoomFound', () => {
                                this.setState({
                                    roomId: result.value,
                                })
                                //checkNumber checks if there are 4 people in the room
                                this.state.socket.emit(
                                    'checkNumber',
                                    this.state.roomId
                                )
                                //if exactly 4 people are in the room, then server.js calls dealHand
                            })
                            this.state.socket.on('NoRoom', (errmsg) => {
                                Swal.fire({
                                    title: errmsg,
                                    cancelButton: true,
                                }).then((window.location = './room'))
                            })
                        })
                    }}
                >
                    Join Room
                </button>
                {/* <RoomHud
                    displayStart={true}
                    socket={this.state.socket}
                    roomId={this.state.roomId}
                /> */}
                <React.Fragment>
                    <div style={{ position: 'relative' }}>
                        <Board
                            board={board}
                            selected={selected}
                            clickCard={this.clickCard}
                            socket={socket}
                            roomId={roomId}
                            hand={hand}
                            currHighest={currHighest}
                            calledBy={calledBy}
                            isReady={isReady}
                            needToWin={needToWin}
                        />
                    </div>
                    {/* <button style={buttonStyle} onClick={this.dealQuery}>
                        Deal hands
                    </button> */}
                    <button style={buttonStyle} onClick={this.callProcess}>
                        Begin calling
                    </button>

                    {/* <button
                        onClick={() =>
                            this.state.socket.emit('startGame', this.state.roomId)
                        }
                        style={longButton}
                    >
                        Start
                    </button> */}
                </React.Fragment>
            </div>
        )
    }
}

//used to render RoundBoard(below), and the player's hand
const Board = (props) => {
    function showCards(hand, result) {
        hand.forEach((card) =>
            result.push(
                <Card
                    face={card.slice(0, 1)}
                    suit={card.slice(1)}
                    onClick={(e, card) =>
                        //console.log(JSON.stringify(card))
                        props.clickCard(e, card)
                    }
                />
            )
        )
    }

    let result = []
    showCards(props.hand, result)
    let PepeHands = () => result

    return (
        <div>
            <RoundBoard selected={props.selected} />
            <PepeHands />
            <div>
                {/*should probably pick a better font for this*/}
                Current highest is: {resultInWords(props.currHighest)}, called
                by {props.calledBy}
                <br />
                {new Array(...props.isReady).join(', ')} is/are ready to start
                <br />
                You need {props.needToWin} sets to win
            </div>
        </div>
    )
}

//used to render the board in each round, (props.selected and props.collected)
const RoundBoard = (props) => {
    // each round => props.selected
    // after each round, add to props.collected

    function showSelected(selected, result) {
        for (let userFS of selected.keys()) {
            result.add(
                <Card
                    face={userFS.slice(20, 21)}
                    suit={userFS.slice(21,)}
                />
            )
        }
    }

    let chosen = new Set()
    showSelected(props.selected, chosen.add(<CardStyles />))
    let DisplaySelected = () => [...chosen]
    return (
        <div>
            <DisplaySelected />
        </div>
    )
}

export default Room
