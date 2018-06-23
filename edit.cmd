@if "%~1"=="" goto usage

set NODE_LANG=%1
@set NODE_ENV=development
@set ASSET_VERSIONING=query
@set WATCH=1
@set SITE_HOST=http://javascript.local
@set PORT=80
@set NODE_PATH=./handlers;./modules
@set PLUNK_REMOTE_OFF=1

call gulp tutorial:import --root /js/javascript-tutorial-%NODE_LANG%

call gulp edit --root /js/javascript-tutorial-%NODE_LANG%

goto :eof

:usage
echo Usage: %0 <Language>
exit /B 1