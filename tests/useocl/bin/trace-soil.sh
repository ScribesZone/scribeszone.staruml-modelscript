SOILFILE=${1?}
USEFILE="${SOILFILE%__*}".use
STCFILE="${SOILFILE%.soil}".stc
echo "creating ${STCFILE?} from ${USEFILE?} "
use -qv ${USEFILE?} ${SOILFILE?} >${STCFILE} 2>&1