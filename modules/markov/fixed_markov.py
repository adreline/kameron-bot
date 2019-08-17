import markovify
import sys
# Get raw text as string.
with open('/home/pi/Downloads/bot-kameron/modules/markov/lotr.txt') as f:
    lotr = f.read()
with open('/home/pi/Downloads/bot-kameron/modules/markov/lovecraft.txt') as f:
    lovecraft = f.read()
# Build the model.
lotr_model = markovify.Text(lotr, state_size=3)
lovecraft_model = markovify.Text(lovecraft, state_size=3)
model_combo = markovify.combine([ lotr_model, lovecraft_model ], [ 1, 1 ])
# Print five randomly-generated sentences

def shake():
    i=0
    while True:
        sentence = model_combo.make_sentence()
        if sentence is not None:
            return sentence
            break
            pass
        if i>1000:
            break
            pass
        i+=1
        pass


story=''
for i in range(10):
    story=story+" "+shake()

print(story)
