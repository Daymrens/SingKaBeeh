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
    lyrics: "Show me how you want it to be\nTell me, baby, 'cause I need to know now\nOh, because\n____",
    answer: "My loneliness is killing me (and I) I must confess I still believe (still believe)", hint: "90s Pop"
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
    file: "Clips/song-11.wav",
    lyrics: "Say, go through the darkest of days\nHeaven's a heartbreak away\nNever let you go, never let me down\n____",
    answer: "Oh, it's been a hell of a ride\nDriving the edge of a knife\nNever let you go, never let me down",
    hint: "2016 EDM Pop"
  },
  {
    id: 12, title: "You Got It All", artist: "The Jets",
    file: "Clips/song-12.wav",
    lyrics: "You got it all over him\nYou got me over him\nHoney, it's true\nThere's just you\n____",
    answer: "You must have been heaven sent\nHearing me call you went\nOut on a limb\nAnd you're all that he's not\nJust look what I got\n'Cause you got it all\nOver him",
    hint: "80s Pop"
  },
  {
    id: 13, title: "Foolish Heart", artist: "Steve Perry",
    file: "Clips/song-13.wav",
    lyrics: "Foolish heart, hear me calling\nStop before you start falling\n____",
    answer: "Foolish heart, heed my warning\nYou've been wrong before\nDon't be wrong anymore",
    hint: "80s Rock"
  },
  {
    id: 14, title: "Later", artist: "Fra Lippo Lippi",
    file: "Clips/song-14.wav",
    lyrics: "How could you come with me\nWhen you knew all along that you had to go?\nHow could you watch me sleep so close to you\nPretending not to know?\n____",
    answer: "How could you memorize my name\nAnd forget who I am?\nHow could you think you're still the same\nBelieving I can?",
    hint: "80s Synthpop"
  },
  {
    id: 15, title: "If", artist: "Bread",
    file: "Clips/song-15.wav",
    lyrics: "If a picture paints a thousand words\nThen why can't I paint you?\nThe words will never show\nThe you I've come to know\n____",
    answer: "If a face could launch a thousand ships\nThen where am I to go?\nThere's no one home but you\nYou're all that's left me too",
    hint: "70s Soft Rock"
  },
  {
    id: 16, title: "Biglang Liko", artist: "Ron Henley",
    file: "Clips/song-16.wav",
    lyrics: "Ang pawis ko'y tumatagaktak\nSa bilis, may pumapalakpak\nAbutin natin ang langit, ibuka ang pakpak\nLanghapin ang halimuyak ng mga bulaklak\nAko ay paruparo, nakadapo sa'yong damo\n____",
    answer: "Sa liwanag ng ganda mo ang daming nabibighaning gamogamo\nYakapin mo ako habang atin ang gabi\nKasi mundo natin ay laging salisi\n'Pag ika'y nasa baba, ako ay nasa taas\nSa tuwing ikaw ay darating, ako ay lalabas",
    hint: "OPM Pop"
  },
  {
    id: 17, title: "Blinding Lights", artist: "The Weeknd",
    file: "Clips/song-17.wav",
    lyrics: "I've been tryna call, I've been on my own for long enough\nMaybe you can show me how to love\n____",
    answer: "Maybe I'm going through withdrawals\nYou don't even have to do too much\nYou can turn off the lights, I don't need to touch", hint: "Synthpop"
  },
  {
    id: 18, title: "Levitating", artist: "Dua Lipa",
    file: "Clips/song-18.wav",
    lyrics: "If you wanna run away with me, I know a galaxy\nAnd I can take you for a ride\n____",
    answer: "I had a premonition that we fell into a rhythm\nWhere the music don't stop for life\nGlitter in the sky, glitter in my eyes", hint: "Dance Pop"
  },
  {
    id: 19, title: "Watermelon Sugar", artist: "Harry Styles",
    file: "Clips/song-19.wav",
    lyrics: "Tastes like strawberries on a summer evenin'\nAnd it sounds just like a song\n____",
    answer: "I want your belly and that summer feeling\nI don't know if I could ever go without", hint: "Pop Rock"
  },
  {
    id: 20, title: "Someone Like You", artist: "Adele",
    file: "Clips/song-20.wav",
    lyrics: "Nevermind, I'll find someone like you\nI wish nothing but the best for you, too\n____",
    answer: "Don't forget me, I beg\nI'll remember you said\nSometimes it lasts in love, but sometimes it hurts instead", hint: "Pop Ballad"
  },
  {
    id: 21, title: "Stay", artist: "The Kid LAROI & Justin Bieber",
    file: "Clips/song-21.wav",
    lyrics: "I do the same thing, I told you that I never would\nI told you I changed, even when I knew I never could\n____",
    answer: "I know that I can't find nobody else as good as you\nI need you to stay, need you to stay, hey", hint: "Pop"
  },
  {
    id: 22, title: "Sunflower", artist: "Post Malone & Swae Lee",
    file: "Clips/song-22.wav",
    lyrics: "Needless to say, I keep her in check\nShe was all bad-bad, nevertheless\n____",
    answer: "Callin' it quits now, baby, I'm a wreck\nCrash at my place, baby, you're a wreck", hint: "Hip Hop Pop"
  },
  {
    id: 23, title: "All of Me", artist: "John Legend",
    file: "Clips/song-23.wav",
    lyrics: "'Cause all of me loves all of you\nLove your curves and all your edges\nAll your perfect imperfections\n____",
    answer: "Give your all to me\nI'll give my all to you\nYou're my end and my beginning", hint: "R&B Ballad"
  },
  {
    id: 24, title: "Despacito", artist: "Luis Fonsi & Daddy Yankee",
    file: "Clips/song-24.wav",
    lyrics: "Quiero respirar tu cuello despacito\nDeja que te diga cosas al oído\n____",
    answer: "Para que te acuerdes si no estás conmigo\nDespacito, quiero desnudarte a besos despacito", hint: "Latin Pop"
  },
  {
    id: 25, title: "Shallow", artist: "Lady Gaga & Bradley Cooper",
    file: "Clips/song-25.wav",
    lyrics: "I'm off the deep end, watch as I dive in\nI'll never meet the ground\nCrash through the surface where they can't hurt us\n____",
    answer: "We're far from the shallow now", hint: "Pop Rock"
  },
  {
    id: 26, title: "Smells Like Teen Spirit", artist: "Nirvana",
    file: "Clips/song-26.wav",
    lyrics: "Load up on guns, bring your friends\nIt's fun to lose and to pretend\n____",
    answer: "She's over-bored and self-assured\nOh no, I know a dirty word", hint: "90s Grunge"
  },
  {
    id: 27, title: "Sweet Child o' Mine", artist: "Guns N' Roses",
    file: "Clips/song-27.wav",
    lyrics: "She's got a smile that it seems to me\nReminds me of childhood memories\nWhere everything was as fresh as the bright blue sky\n____",
    answer: "Now and then when I see her face\nShe takes me away to that special place", hint: "80s Rock"
  },
  {
    id: 28, title: "Billie Jean", artist: "Michael Jackson",
    file: "Clips/song-28.wav",
    lyrics: "Billie Jean is not my lover\nShe's just a girl who claims that I am the one\n____",
    answer: "But the kid is not my son\nShe says I am the one, but the kid is not my son", hint: "80s Pop"
  },
  {
    id: 29, title: "Get Lucky", artist: "Daft Punk ft. Pharrell Williams",
    file: "Clips/song-29.wav",
    lyrics: "Like the legend of the phoenix\nAll ends with beginnings\nWhat keeps the planet spinning\nThe force from the beginning\n____",
    answer: "We've come too far to give up who we are\nSo let's raise the bar and our cups to the stars", hint: "Funk Disco"
  },
  {
    id: 30, title: "Happy", artist: "Pharrell Williams",
    file: "Clips/song-30.wav",
    lyrics: "Clap along if you feel like a room without a roof\nClap along if you feel like happiness is the truth\n____",
    answer: "Clap along if you know what happiness is to you\nClap along if you feel like that's what you wanna do", hint: "Pop"
  },
  {
    id: 31, title: "Drivers License", artist: "Olivia Rodrigo",
    file: "Clips/song-31.wav",
    lyrics: "I got my driver's license last week\nJust like we always talked about\n'Cause you were so excited for me\nTo finally drive up to your house\n____",
    answer: "But today I drove through the suburbs\nCryin' 'cause you weren't around", hint: "Alt Pop"
  },
  {
    id: 32, title: "Sunkissed", artist: "Lola Amour",
    file: "Clips/song-32.wav",
    lyrics: "Sabi ko sa sarili ko 'wag nang umasa pa\nNgunit ba't 'di ko mapigilan\n____",
    answer: "Ang pusong nagwawala\nLaman ka ng aking panaginip\nSana'y 'di ka na magising pa", hint: "OPM Pop"
  },
  {
    id: 33, title: "Tadhana", artist: "Up Dharma Down",
    file: "Clips/song-33.wav",
    lyrics: "Malay mo, nakatakda\nAng pag-ibig nating dalawa\nBawat saglit na lumilipas\nSana'y 'di ka na magbabalik pa\n____",
    answer: "Ang hiling ko lang naman\nAy ang makapiling ka\nSa'king paggising, ika'y nariyan pa", hint: "OPM Alternative"
  },
  {
    id: 34, title: "Kahit Ayaw Mo Na", artist: "This Band",
    file: "Clips/song-34.wav",
    lyrics: "Wag mo sanang isipin na ako'y nagbago\nAng pag-ibig ko sa'yo ay hindi naglaho\n____",
    answer: "Kahit ayaw mo na, kahit ayaw mo na\nAko'y mananatili pa rin\nMaghihintay sa'yo hanggang sa huling sandali", hint: "OPM Pop"
  },
  {
    id: 35, title: "214", artist: "Rivermaya",
    file: "Clips/song-35.wav",
    lyrics: "Kanino ka pa babaling\nKung ako'y iyong iiwan\n____",
    answer: "Ang puso ko'y nabibiyak\nSa bawat awit na aking natutunan\nHindi ko masabi ang nararamdaman", hint: "OPM Rock"
  },
  {
    id: 36, title: "With a Smile", artist: "Eraserheads",
    file: "Clips/song-36.wav",
    lyrics: "Lift your head, baby, don't be scared\nOf the things that could go wrong along the way\nYou'll get by with a smile\n____",
    answer: "Now you can't be sure when you're not feelin' right\nLife takes its toll on you, but you'll make it through", hint: "OPM Rock"
  },
  {
    id: 37, title: "Halaga", artist: "Parokya ni Edgar",
    file: "Clips/song-37.wav",
    lyrics: "Hindi ko alam kung bakit\nIkaw ang napili ng puso ko\nSa dami ng aking nakilala\n____",
    answer: "Ikaw lang ang nagpabago sa aking mundo\nIkaw ang aking halaga", hint: "OPM Pop"
  },
  {
    id: 38, title: "Bakit Pa Ba", artist: "Jay R",
    file: "Clips/song-38.wav",
    lyrics: "Bakit pa ba sasabihin?\nKung 'di naman pala sigurado\n____",
    answer: "Nasaktan mo na naman ako\nHindi ko na alam kung saan pupunta\n'wag mo sanang sabihin sa akin", hint: "OPM R&B"
  },
  {
    id: 39, title: "Pangarap Lang Kita", artist: "Parokya ni Edgar",
    file: "Clips/song-39.wav",
    lyrics: "Kung akin lang ang mundo\nGagawin kong ikaw ang aking sinta\n____",
    answer: "Ngunit panahon ay 'di pabor sa akin\nPangarap lang kita, pangarap lang talaga", hint: "OPM Pop"
  },
  {
    id: 41, title: "Dati", artist: "Quest feat. Abra",
    file: "Clips/song-41.wav",
    lyrics: "Lumipas ang maraming gabi\nNgunit ba't 'di ka pa rin magunaw sa aking isip?\n____",
    answer: "Ang init ng kape at ang lamig ng simoy ng hangin\nHabang ako'y nag-iisa at alaala mo'y gumuguhit", hint: "OPM Hip Hop"
  },
  {
    id: 42, title: "Pagsamo", artist: "Arthur Nery",
    file: "Clips/song-42.wav",
    lyrics: "Bakit 'di na lang ako ang iyong mahalin?\nBakit ba 'di na lang ako ang iyong piliin?\n____",
    answer: "Handa na ba ang puso mo?\nO ako na lang, oh, ako na lang\nAko na lang sana, aking sinta", hint: "OPM R&B"
  },
  {
    id: 43, title: "Sa Susunod Na Lang", artist: "SUD",
    file: "Clips/song-43.wav",
    lyrics: "Sa susunod na lang\nKung sakaling magtagpo man ang ating mga daan\n____",
    answer: "Huwag kang mag-alala, aking sinta\nSa susunod na lang kung magkita man tayo", hint: "OPM Alternative"
  },
  {
    id: 44, title: "Leaves", artist: "Ben&Ben",
    file: "Clips/song-44.wav",
    lyrics: "Stay with me, hold my hand\nThere's no need to be afraid\nI'll be here by your side\n____",
    answer: "Even if the leaves fall down\nEven if the skies turn gray\nI'll be here holding on", hint: "OPM Folk Pop"
  },
  {
    id: 45, title: "Kathang Isip", artist: "Ben&Ben",
    file: "Clips/song-45.wav",
    lyrics: "Ang awit na ito ay para sa iyo\nMga gunita na puno ng kulay\n____",
    answer: "Kung akin ka lang sana sa aking tabi\nHindi na maglalaho ang ngiti\nSa bawat sandaling ika'y kapiling", hint: "OPM Folk Pop"
  },
];

export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default DEFAULT_SONGS;
