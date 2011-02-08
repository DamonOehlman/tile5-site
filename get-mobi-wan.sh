# move files to backups
mv _config.yml _config.yml.bak
mv app.yaml app.yaml.bak
mv README.md README.md.bak
mv index.mdown index.mdown.bak
find . -name 'custom-*' | sed /\.bak/s/// | xargs -I file mv file file.bak
# mv css/style.css css/style.css.bak

# update from the mobi-wan template directory
cp -R -f /development/projects/github/sidelab/mobi-wan/* .

# restore the file backups to the original location
find . -name '*.bak' | sed /\.bak/s/// | xargs -I file mv file.bak file