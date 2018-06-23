@if "%~1"=="" goto usage

set NODE_LANG=%1
@set NODE_ENV=development
@set ASSET_VERSIONING=query
@set WATCH=1
@set SITE_HOST=http://javascript.local
@set PORT=80
@set NODE_PATH=./handlers;./modules
@set TUTORIAL_EDIT=1

call gulp dev

goto :eof

:usage
echo Usage: %0 <Language>
exit /B 1
