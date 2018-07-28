@if "%~1"=="" goto usage

set NODE_LANG=%1
@set NODE_ENV=development
@set ASSET_VERSIONING=query
@set WATCH=1
@set NODE_PATH=./handlers;./modules

call gulp dev

goto :eof

:usage
echo Usage: %0 <Language>
exit /B 1
