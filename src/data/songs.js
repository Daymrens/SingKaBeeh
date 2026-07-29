const DEFAULT_SONGS = [
  {
    id: 1, title: "Pantropiko'", artist: "BINI",
    file: "Songs/song-01.mp3",
    lyrics: "From following your footprints in the sand\nTo walking with you on this island\nGuided by the grip of your hand\nI can feel you're holding my world\n____",
    answer: "Ano ba itong nadarama oh shux Ito ba'y pag-ibig na ha Totoo ba ang pinadama Cause boy it feels so good", hint: "PPop Girl Group"
  },
  {
    id: 2, title: "Bohemian Rhapsody", artist: "Queen",
    file: "Songs/song-02.mp3",
    lyrics: "Is this the real life?\nIs this just fantasy?\n____",
    answer: "Caught in a landslide, no escape from reality", hint: "70s Rock Opera"
  },
  {
    id: 3, title: "Dancing Queen", artist: "ABBA",
    file: "Songs/song-03.mp3",
    lyrics: "You can dance, you can jive\nHaving the time of your life\n____",
    answer: "Ooh, see that girl, watch that scene, diggin' the dancing queen", hint: "70s Disco Pop"
  },
  {
    id: 4, title: "...Baby One More Time", artist: "Britney Spears",
    file: "Songs/song-04.mp3",
    lyrics: "Show me how you want it to be\nTell me, baby, 'cause I need to know now\nOh, because",
    answer: "Show me how you want it to be", hint: "90s Pop"
  },
  {
    id: 5, title: "Rolling in the Deep", artist: "Adele",
    file: "Songs/song-05.mp3",
    lyrics: "The scars of your love remind me of us\n____",
    answer: "They keep me thinkin' that we almost had it all", hint: "2010s Soul"
  },
  {
    id: 6, title: "Shape of You", artist: "Ed Sheeran",
    file: "Songs/song-06.mp3",
    lyrics: "The club isn't the best place to find a lover\nSo the bar is where I go\n____",
    answer: "Me and my friends at the table doing shots, drinking fast and then we talk slow", hint: "2010s Pop"
  },
  {
    id: 7, title: "Uptown Funk", artist: "Bruno Mars",
    file: "Songs/song-07.mp3",
    lyrics: "This hit, that ice cold, Michelle Pfeiffer, that white gold\n____",
    answer: "This one for them hood good girls, them good girls straight masterpieces", hint: "2010s Funk"
  },
  {
    id: 8, title: "bad guy", artist: "Billie Eilish",
    file: "Songs/song-08.mp3",
    lyrics: "White shirt now red, my bloody nose\nSleeping, you're on your tippy toes\n____",
    answer: "Creeping around like no one knows, think you're so criminal", hint: "2010s Alt Pop"
  },
  {
    id: 9, title: "Shake It Off", artist: "Taylor Swift",
    file: "Songs/song-09.mp3",
    lyrics: "My ex-man brought his new girlfriend\n____",
    answer: "She's like, Oh my God, but I'm just gonna shake", hint: "2010s Pop"
  },
  {
    id: 10, title: "Eye of the Tiger", artist: "Survivor",
    file: "Songs/song-10.mp3",
    lyrics: "Risin' up, back on the street\nDid my time, took my chances\n____",
    answer: "Went the distance, now I'm back on my feet, just a man and his will to survive", hint: "80s Rock"
  },
  {
    id: 11, title: "Let Me Love You", artist: "DJ Snake / Justin Bieber",
    file: "Songs/song-11.mp3",
    lyrics: "Say, go through the darkest of days\nHeaven's a heartbreak away\nNever let you go, never let me down\n____",
    answer: "Oh, it's been a hell of a ride\nDriving the edge of a knife\nNever let you go, never let me down",
    hint: "2016 EDM Pop"
  },
  {
    id: 12, title: "You Got It All", artist: "The Jets",
    file: "Songs/song-12.mp3",
    lyrics: "You got it all over him\nYou got me over him\nHoney, it's true\nThere's just you\n____",
    answer: "You must have been heaven sent\nHearing me call you went\nOut on a limb\nAnd you're all that he's not\nJust look what I got\n'Cause you got it all\nOver him",
    hint: "80s Pop"
  },
  {
    id: 13, title: "Foolish Heart", artist: "Steve Perry",
    file: "Songs/song-13.mp3",
    lyrics: "Foolish heart, hear me calling\nStop before you start falling\n____",
    answer: "Foolish heart, heed my warning\nYou've been wrong before\nDon't be wrong anymore",
    hint: "80s Rock"
  },
  {
    id: 14, title: "Later", artist: "Fra Lippo Lippi",
    file: "Songs/song-14.mp3",
    lyrics: "How could you come with me\nWhen you knew all along that you had to go?\nHow could you watch me sleep so close to you\nPretending not to know?\n____",
    answer: "How could you memorize my name\nAnd forget who I am?\nHow could you think you're still the same\nBelieving I can?",
    hint: "80s Synthpop"
  },
  {
    id: 15, title: "If", artist: "Bread",
    file: "Songs/song-15.mp3",
    lyrics: "If a picture paints a thousand words\nThen why can't I paint you?\nThe words will never show\nThe you I've come to know\n____",
    answer: "If a face could launch a thousand ships\nThen where am I to go?\nThere's no one home but you\nYou're all that's left me too",
    hint: "70s Soft Rock"
  },
  {
    id: 16, title: "Biglang Liko", artist: "Ron Henley",
    file: "Songs/song-16.mp3",
    lyrics: "Ang pawis ko'y tumatagaktak\nSa bilis, may pumapalakpak\nAbutin natin ang langit, ibuka ang pakpak\nLanghapin ang halimuyak ng mga bulaklak\nAko ay paruparo, nakadapo sa'yong damo\n____",
    answer: "Sa liwanag ng ganda mo ang daming nabibighaning gamogamo\nYakapin mo ako habang atin ang gabi\nKasi mundo natin ay laging salisi\n'Pag ika'y nasa baba, ako ay nasa taas\nSa tuwing ikaw ay darating, ako ay lalabas",
    hint: "OPM Pop"
  }
];

export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default DEFAULT_SONGS;
