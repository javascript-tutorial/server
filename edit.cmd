@if "%~1"=="" goto usage

@set NODE_LANG=%1
@set NODE_ENV=production
@set TUTORIAL_EDIT=1
@set ASSET_VERSIONING=query
@set WATCH=1
@set NODE_PATH=./handlers;./modules

call gulp edit

goto :eof

:usage
echo Usage: %0 <Language>
exit /B 1