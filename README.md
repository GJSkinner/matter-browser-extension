# matter-browser-extension
An A.I. powered browser extension for the detection of fake news

Provides an instant prediction for - and analysis of - a given article.

Highlights any line within the article identified as being either positive or negative in sentiment directly on the webpage.

<img src="https://user-images.githubusercontent.com/56996684/194751903-720f780a-cc48-4239-994c-cd6f039aed75.png" width="210" height="500" />

The graphical interface of the extension is built using HTML and CSS while the underlying functionality and dynamic elements are programmed in JavaScript. 

Predictions are based upon the linguistic features of the given text and the network features of the site hosting it.

Linguistic features include punctuation usage, the frequency of certain word types and the general sentiment.

The sentiment is calculated by searching for and tallying words known to correlate with either positive or negative feelings. 

Network features include the bounce rate, website rank and page views per visitor.

This data is scraped from the web and fed into a K-Nearest Neighbour machine learning algorithm.

The algorithm learns to classify articles by comparing them against a database of labelled examples and calculating the group into which they best fit. 
