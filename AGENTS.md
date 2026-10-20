<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Assignment data lives in Lovable Cloud: `assignments` is public (read/insert), `assignment_contacts` and `interest_registrations` are insert-only for the site so personal data never reaches the browser; `interest_count` is bumped by a SECURITY DEFINER trigger.
- Shared header/footer live in `src/routes/__root.tsx`; Swedish URL slugs (/uppdrag, /lamna-uppdrag, /integritet).
