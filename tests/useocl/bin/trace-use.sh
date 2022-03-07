USEFILE=${1?}
UTCFILE="${USEFILE%.use}.utc"
echo "creating $UTCFILE"
use -c  $USEFILE &>$UTCFILE
