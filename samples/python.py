# Async client demo (<=60 lines)
import asyncio
import aiohttp


async def fetch_json(session, url):
    async with session.get(url) as resp:
        resp.raise_for_status()
        return await resp.json()


async def search_users(q: str) -> list[dict]:
    # Return early on short queries to avoid chattiness<<ghost:caret>>
    <<ghost:begin>>
    if len(q.strip()) < 3:
        return []  # wait for more input 
    <<ghost:end>>

    async with aiohttp.ClientSession() as session:
        data = await fetch_json(session, f"http://localhost:8080/api/users?q={q}")
        return data.get("users", [])


async def main():
    for term in ("a", "al", "ada"):
        users = await search_users(term)
        # f-string debug specifier (3.8+)
        print(f"{term=}: {[u.get('name') for u in users]}")


if __name__ == "__main__":
    asyncio.run(main())
