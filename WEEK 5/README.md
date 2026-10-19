# Week 5 Git Practice

Branching, merging, conflict resolution, rebase, and stash practice.



PART B — Start at the bottom

Point to:

* da0f3da chore: add initial app

Say:

“For Part B, I first created the scratch repository and made the initial app.js file with const color = "blue";. I committed that as my starting point.”

Then point to:

| * 4e26ccf (feature/theme) feat: change theme color to green
|/

Say:

“From that starting point, I created the feature/theme branch. On that branch, I changed the color from blue to green and committed the change.”

⚠️ Then explain something that the graph no longer shows

Don't pretend the graph contains the whole conflict process.

Say:

“I then switched back to main and changed that same line from blue to red. When I merged feature/theme into main, Git detected a conflict because both branches had changed the same line differently. I manually resolved that conflict by removing Git's conflict markers and setting the final value to teal.”

This is important: your current graph doesn't show the conflict-resolution commit because Part C later instructed you to reset the history.

S

🟡 PART C — Now move to this section

Point to:

* 2e74c9a (main, feature/stash-demo) feat: main progress

Say:

“For Part C, I reset the repository as instructed so I could create a separate rebase exercise. I then created feature/rebased.”

Now point to:

| * 04a6e56 (feature/rebased) feat: rebase practice
|/
* 2e74c9a

Say:

“On feature/rebased, I added the feature work and committed it as feat: rebase practice. Separately, main received the feat: main progress commit.”

Then explain the visual:

“I then ran git rebase main. Instead of creating a merge commit, Git replayed the feature commit on top of the main commit. That's why the history is represented as a linear progression.”

THIS is what the |/ means conceptually

You don't need to explain every character.

Just say:

“The graph shows the feature work being based on the main commit rather than creating a separate merge commit.”

🔴 PART D — Look at the top

Now point to:

* 0ac6af7 (HEAD -> hotfix/typo) fix: correct typo

Say:

“For Part D, I created feature/stash-demo and made unfinished changes to app.js. I didn't want to commit those unfinished changes because an urgent hotfix was needed.”

Then explain what happened between the commits, even though the stash itself isn't represented as a normal commit in this graph:

“I used git stash to temporarily save my unfinished work. I then switched to main, created the hotfix/typo branch, fixed the typo, and committed the fix.”

Point to:

0ac6af7 fix: correct typo

“This is the hotfix commit.”

Then:

“After that, I returned to feature/stash-demo and used git stash pop to restore my unfinished work. The stash itself doesn't appear as a normal commit in this graph because stash is a separate Git mechanism.”

🔵 What about this?

Your graph says:

(main, feature/stash-demo)

This means both branches currently point to the same commit:

2e74c9a

You can say:

“At this point, main and feature/stash-demo point to the same commit because the stash work was uncommitted. The actual unfinished changes were restored to the working directory rather than becoming a new commit.”

That's actually a good detail to understand.

So your actual presentation while looking at the screen

You can literally do this:

Point to bottom:

“This is where my scratch repository started. I created the initial app with the color set to blue.”

Point to feature/theme:

“I created the feature/theme branch and changed the color to green.”

Explain the missing conflict:

“On main I changed that same line to red, so when I merged the feature branch, Git couldn't decide which version to use. That created the conflict. I resolved it manually and chose teal.”

Move to main / feature/rebased:

“For Part C, I reset as instructed and created a new feature branch called feature/rebased. I made feature work there and separate progress on main.”

Point to 04a6e56:

“This is my rebase practice commit.”

Point to 2e74c9a:

“This is the main progress commit.”

Explain the relationship:

“I then rebased the feature branch onto main, which replayed the feature commit on top of main and gave me a linear history without a merge commit.”

Point to hotfix/typo:

“For Part D, I had unfinished work on feature/stash-demo, so I used git stash to temporarily save it. I then created this hotfix branch, fixed the typo, and committed the fix.”

Finish:

“After handling the hotfix, I returned to the feature branch and used git stash pop to restore my unfinished work. I then checked git stash list to verify that the stash was empty.”