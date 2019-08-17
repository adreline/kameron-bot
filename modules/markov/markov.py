import markovify
import sys
# Get raw text as string.
# source state length     var srccc='/home/pi/Downloads/bot-kameron/modules/markov/'++'.txt';

with open('/home/pi/Downloads/bot-kameron/modules/markov/'+sys.argv[1]+'.txt') as f:
    text = f.read()
# Build the model.
text_model = markovify.Text(text, state_size=int(sys.argv[2]))
# Print five randomly-generated sentences

def shake():
    i=0
    while True:
        sentence = text_model.make_sentence()
        if sentence is not None:
            return sentence
            break
            pass
        if i>1000:
            break
            pass
        i+=1
        pass

def shake_short(j):
    i=0
    while True:
        sentence = text_model.make_short_sentence(j)
        if sentence is not None:
            return sentence
            break
            pass
        if i>1000:
            break
            pass
        i+=1
        pass

if sys.argv[3] == 'story':
    story=''
    for i in range(10):
        story=story+" "+shake()
    print(story);
    pass
if sys.argv[3] == 'quoute':
        print(shake_short(80))

if sys.argv[3] == 'title':
        print(shake_short(13))
