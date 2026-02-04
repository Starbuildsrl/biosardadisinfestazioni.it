# Comandi Git per biosardadisinfestazioni.it

Repository: https://github.com/Starbuildsrl/biosardadisinfestazioni.it.git

## Primo utilizzo (se non hai ancora inizializzato Git nella cartella)

Apri il terminale (PowerShell o CMD) nella cartella del progetto e esegui in ordine:

```batch
cd "a:\06 - Siti Web e Applicazioni\06 - Biosarda"

git init
git remote add origin https://github.com/Starbuildsrl/biosardadisinfestazioni.it.git
git branch -M main
git add .
git status
git commit -m "Sito Biosarda Disinfestazioni - aggiornamento completo"
git push -u origin main
```

## Utilizzo successivo (dopo aver già fatto il primo push)

Ogni volta che modifichi file e vuoi aggiornare GitHub:

```batch
cd "a:\06 - Siti Web e Applicazioni\06 - Biosarda"

git add .
git status
git commit -m "Descrizione delle modifiche"
git push
```

## Se hai già inizializzato Git e la remote esiste

Se `git init` e `git remote add` sono già stati fatti, usa solo:

```batch
cd "a:\06 - Siti Web e Applicazioni\06 - Biosarda"

git add .
git status
git commit -m "Sito Biosarda - aggiornamento"
git push -u origin main
```

## Se il push fallisce (la repo ha già file)

Se GitHub restituisce che il push è rifiutato perché ci sono commit sul remote che non hai in locale:

```batch
git pull origin main --allow-unrelated-histories
```
Risolvi eventuali conflitti se richiesto, poi:

```batch
git push -u origin main
```

## File/cartelle esclusi (tramite .gitignore)

- README.txt  
- server.bat  
- PIANO_AGGIORNAMENTO.md  
- B3213_Revisione_sito_biosarda controfirmato.pdf  
- materiale fotografico/  
- materiale testuale/  
- .claude/ (configurazione locale)

Verifica con `git status` che questi elementi non compaiano tra i file da aggiungere.
