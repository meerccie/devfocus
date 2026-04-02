import { Controller, Get, Param, Inject } from '@nestjs/common';
// Change this line to use 'type' for the interface
import { GITHUB_REPO_PORT } from '../../application/ports/github-repository.port';
import type { IGithubRepository } from '../../application/ports/github-repository.port';

@Controller('github')
export class GithubController {
  constructor(
    @Inject(GITHUB_REPO_PORT) private readonly githubRepo: IGithubRepository,
  ) {}

  @Get('user/:username')
  async getProfile(@Param('username') username: string) {
    return await this.githubRepo.getUser(username);
  }
}
